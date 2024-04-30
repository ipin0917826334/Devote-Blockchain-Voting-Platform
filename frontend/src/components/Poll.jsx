import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Checkbox, Alert, Image, Radio, Modal, Spin, Typography, Row, Col } from 'antd';
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from './UserContext';
import axios from 'axios';

const Poll = ({ topicPoll, setSelectedChoicesPoll, pinFromJoin, setHash }) => {
    const { topicId } = useParams();
    const [error, setError] = useState(null);
    const [selectedChoices, setSelectedChoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [voteSubmitted, setVoteSubmitted] = useState(false);
    const [showAlreadyVotedModal, setShowAlreadyVotedModal] = useState(false);
    const [showClosedModal, setShowClosedModal] = useState(false);
    const { user } = useContext(UserContext);
    const { Text } = Typography;

    const navigate = useNavigate();

    const handleThreeVoteClick = async (choice) => {
        setLoading(true);
        setError(null);
        setSelectedChoices([choice]);
        await onFinish([choice]);
    };

    async function castVote(topicId, choices, pin, invitationType, voteTime, pinId) {
        try {
            const token = localStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = token;
    
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/vote`, {
                topicId,
                userEmail: user.email,
                choices,
                pin,
                invitationType,
                voteTime,
                pinId
            });
    
            const data = response.data;
            if (!data.success) {
                if (data.error === "You already vote for this poll") {
                    setShowAlreadyVotedModal(true);
                    throw new Error(data.error);
                } else {
                    setShowClosedModal(true);
                    throw new Error(data.error);
                }
            }
            setHash(data.hash);
            return data;
        } catch (error) {
            throw error;
        }
    }
    

    const onFinish = async (choices) => {
        try {
            if (voteSubmitted) {
                // console.log('Vote already submitted.');
                return;
            }
            setVoteSubmitted(true);
            const voteChoices = choices || selectedChoices;

            await castVote(topicId, voteChoices, pinFromJoin, topicPoll.invitationType, new Date().toLocaleString() + "", topicPoll.pinObjectId);

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/topic/${topicPoll.id}`);
            const updatedTopicData = response.data;
            if (updatedTopicData.success && updatedTopicData.topic) {
                const allChoices = updatedTopicData.topic.choices;
                setSelectedChoicesPoll(allChoices);
            } else {
                throw new Error(updatedTopicData.error || 'Unknown error occurred');
            }

            navigate(`/resultPoll/${topicPoll.id}`);
        } catch (error) {
            console.error("Error during voting process:", error);
        } finally {
            setLoading(false);
        }
    };
    const renderThreeVoteButtons = () => {
        const buttonStyle = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            color: 'white',
            height: '50px',
            fontSize: '18px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            padding: '70px 30px',
        };

        return (
            <Row gutter={[16, 16]} justify="center">
                <Col xs={24} sm={8}>
                    <Button
                        block
                        onClick={() => handleThreeVoteClick("Agree")}
                        style={{ ...buttonStyle, backgroundColor: 'green' }}
                    >
                        Agree
                    </Button>
                </Col>
                <Col xs={24} sm={8}>
                    <Button
                        block
                        onClick={() => handleThreeVoteClick("Against")}
                        style={{ ...buttonStyle, backgroundColor: 'red' }}
                    >
                        Against
                    </Button>
                </Col>
                <Col xs={24} sm={8}>
                    <Button
                        block
                        onClick={() => handleThreeVoteClick("Abstain")}
                        style={{ ...buttonStyle, backgroundColor: 'grey' }}
                    >
                        Abstain
                    </Button>
                </Col>
            </Row>
        );
    };
    const renderPointButtons = () => {
        const buttonStyle = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            color: 'white',
            height: '50px',
            fontSize: '20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            padding: '0px 0px',
        };

        const calculateColor = (index, total) => {
            const hueStart = 0;
            const hueEnd = 120;
            const hue = ((index / total) * (hueEnd - hueStart)) + hueStart;
            return `hsl(${hue}, 75%, 50%)`;
        };

        return (
            <Row gutter={[1, 2]} justify="center">
                {Array.from({ length: 10 }, (_, i) => (
                    <Col key={i} xs={8} sm={8} md={9} lg={2} style={{ marginRight: "3.5px" }}>
                        <Button
                            block
                            onClick={() => handleThreeVoteClick(`${i + 1}`)}
                            style={{
                                ...buttonStyle,
                                backgroundColor: calculateColor(i, 10)
                            }}
                        >
                            {i + 1}
                        </Button>
                    </Col>
                ))}
            </Row>
        );
    };


    const onCheckboxChange = (checkedValues) => {
        if ((topicPoll.ballotType === "single" || topicPoll.ballotType === "three_vote" || topicPoll.ballotType === "point") && checkedValues.length > 1) {
            checkedValues = [checkedValues[checkedValues.length - 1]];
        }
        setSelectedChoices(checkedValues);
    };

    const renderChoices = () => {
        if (topicPoll.ballotType === "single") {
            return (
                <Radio.Group style={{ width: '100%' }} onChange={e => setSelectedChoices([e.target.value])} className="flex-col shadow-2xl bg-[#FFFFFF] p-10 bg-opacity-60 rounded-md overflow-y-auto h-[250px]">
                    {topicPoll.choices && topicPoll.choices.map((choiceObj, index) => (
                        <div key={index}>
                            <Radio value={choiceObj.choice} className='pb-5 text-2xl font-junge'>{index + 1}. {choiceObj.choice}</Radio>
                        </div>
                    ))}
                </Radio.Group>
            );
        } else if (topicPoll.ballotType === "three_vote") {
            return renderThreeVoteButtons();
        } else if (topicPoll.ballotType === "point") {
            return renderPointButtons();
        } else if (topicPoll.ballotType === "multiple") {
            return (
                <Checkbox.Group style={{ width: '100%' }} className="flex-col shadow-2xl bg-[#FFFFFF] p-10 bg-opacity-60 rounded-md " onChange={onCheckboxChange}>
                    {topicPoll.choices && topicPoll.choices.map((choiceObj, index) => (
                        <div key={index} className=''>
                            <Checkbox value={choiceObj.choice} className='pb-5 text-2xl font-junge'>{index + 1}. {choiceObj.choice}</Checkbox>
                        </div>
                    ))}
                </Checkbox.Group>
            );
        }
    };

    return (
        <Form
            name="normal_login"
            className=""
            initialValues={{ remember: true }}
            onFinish={async () => {
                setLoading(true);
                setError(null);
                await onFinish(selectedChoices);
            }}
        >
            <div className="flex h-screen bg-white justify-center items-center px-4 sm:px-0" style={{ backgroundImage: "url('/images/image 6.png')", backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
                <div className="bg-[#DEE9EF] px-[50px] rounded-md  w-[400px] sm:w-1/1 md:w-1/2 lg:w-1/3 max-w-3xl shadow-2xl">
                    {error && <Alert message={error} type="error" closable />}
                    <div className="flex-col font-junge">
                        {error && <Alert message={error} type="error" closable />}
                        <div className='flex justify-center items-center pb-10 p-5' >
                            <Image src={`${import.meta.env.VITE_BACKEND_URL}/`+topicPoll.image} width="400px" className='rounded-lg' />
                        </div>

                        <div className='text-2xl align-left p-3'>
                            Title: {topicPoll.title}
                        </div>
                        <div className='text-2xl align-left p-3'>
                            Description: {topicPoll.description}
                        </div>
                        <Form.Item
                            name="selectedChoices"
                            rules={[{ required: true, message: 'Please Select your Choices!' }]}
                            labelCol={{ span: 24 }}
                        >
                            <div className='text-2xl align-left flex-col'>
                                {renderChoices()}
                            </div>
                        </Form.Item>

                        {topicPoll.ballotType !== "three_vote" && topicPoll.ballotType !== "point" && (
                            <div className='flex justify-center items-center'>
                                <div className='w-1/2'>
                                    <Button type="primary" htmlType="submit" disabled={voteSubmitted} className="login-form-button pt-5 pb-5 flex justify-center items-center">
                                        <div className='font-junge text-xl'>Submit</div>
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className='flex justify-end font-junge text-xl' >
                            Poll By {topicPoll.name}
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                title="Poll Closed"
                visible={showClosedModal}
                footer={null}
                closable={false}
                centered
                maskClosable={true}
                keyboard={false}
            >
                <p className="text-center">The poll is currently closed.</p>
                <div className="flex justify-center mt-5">
                    <Button type="primary" onClick={() => {
                        setShowClosedModal(false);
                        navigate(`/vote-link/${topicId}`);
                    }}>
                        OK
                    </Button>
                </div>
            </Modal>
            <Modal
                title="Already Voted"
                visible={showAlreadyVotedModal}
                footer={null}
                closable={false}
                centered
                maskClosable={true}
                keyboard={false}
            >
                <p>You have already voted in this poll.</p>
                <div className="flex justify-center mt-5">
                    <Button type="primary" onClick={() => {
                        setShowAlreadyVotedModal(false);
                        navigate(`/vote-link/${topicId}`);
                    }}>
                        OK
                    </Button>
                </div>
            </Modal>
            <Modal
                title="Waiting to Confirm Transaction"
                visible={loading}
                footer={null}
                closable={false}
                centered
                bodyStyle={{ textAlign: 'center', padding: '24px' }}
            >
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '150px'
                }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                        Processing...
                    </div>
                </div>
            </Modal>
        </Form>
    );
};

export default Poll;
