import React, { useEffect, useContext, useState } from 'react';
import { Card, Spin, Modal, Button } from 'antd';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const History = ({ setHistory }) => {
  const { user } = useContext(UserContext);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = token;
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/topics/email/${user.email}`);
      if (response.status !== 200) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      setTopics(response.data.topics);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setHistory('history');
    fetchTopics();
    const intervalHistory = setInterval(fetchTopics, 60000);
    return () => clearInterval(intervalHistory);
  }, []);

  useEffect(() => {
    if (!loading && topics.length === 0) {
      setShowModal(true);
    }
  }, [loading, topics]);

  const handleModalOk = () => {
    setShowModal(false);
    navigate('/create');
  };

  if (loading) {
    return <div className="flex justify-center items-center center bg-[#DEE9EF] h-screen"><Spin size="large" tip="Loading..." /></div>;
  } else {
    return (
      <div className="flex justify-center bg-[#DEE9EF] h-screen font-junge">
        <div className="bg-[#FFFFFF] w-3/5 p-5 mt-10">
          <p className="text-5xl font-thin mb-5">Vote History</p>
          <div className="flex flex-wrap">
            {topics.map((topic, idx) => (
              <Card
                hoverable
                style={{}}
                key={topic.id}
                cover={<img alt="example" src={`${import.meta.env.VITE_BACKEND_URL}/`+topic.image} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />}
                onClick={() => { navigate(`/results/${topic.id}`); }}
                className="m-2 lg:w-1/6 md:w-1/3 bg-[#0b101c] text-white"
              >
                <p>Title : {topic.title}</p>
                <p>You Voted For : {topic.choices.filter((choice) => choice.voters.includes(user.email)).map((choice, ind) => ind == 0 ? `${choice.choice}` : `, ${choice.choice}`)}</p>
              </Card>
            ))}
          </div>
        </div>
        <Modal
          title="No Topic History"
          visible={showModal}
          footer={[
            <Button key="ok" type="primary" onClick={handleModalOk}>
              OK
            </Button>
          ]}
          closable={false}
        >
          <p>There are no topic histories. Please create a new topic.</p>
        </Modal>
      </div>
    );
  }
};

export default History;
