import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Alert, Modal, Spin } from 'antd';
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import axios from 'axios';
import bcrypt from 'bcryptjs';
const Register = () => {
    const [error, setError] = useState(null);
    const [visible, setVisible] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [email, setEmail] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const onFinish = (values) => {
        // console.log('Received values of form: ', values);
        setIsModalVisible(true);
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const onConfirmRegister = async () => {
        setLoading(true);
        const saltRounds = 10;
        const hashedPassword = bcrypt.hashSync(password, saltRounds);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/register`, {
                email,
                firstName,
                lastName,
                hashedPassword,
            });
            if (response.data.success) {
                setEmail("");
                setFirstName("");
                setLastName("");
                setPassword("");
                setConfirmPassword("");
                navigate(`/login`);
            } else {
                console.error('Error registering:', response.data.error);
            }
        } catch (e) {
            console.error('Error:', e.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="flex h-screen bg-white">
            <div className="w-2/4 w24 flex mt-20 flex-col ">
                {error && <Alert message={error} type="error" closable />}
                <div className='text-5xl font-inconsolata pl-20'>DeVote</div>
                <div className='text-3xl font-inconsolata pl-20 mt-10'>Create your account</div>
                <div className="register-form-container pl-20 mt-5">
                    <Form
                        form={form}
                        name="registration_form"
                        className="registration-form"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <Form.Item
                            label={
                                <span>
                                    Email Address<br />
                                    <small style={{ fontWeight: 'normal', fontSize: '12px', color: '#888' }}>
                                        We recommend using your work email
                                    </small>
                                </span>
                            }
                            name="email"
                            rules={[{ type: 'email', message: 'The input is not valid E-mail!' }, { required: true, message: 'Please input your Email!' },
                            ({ getFieldValue }) => ({
                                validator: async (_, value) => {
                                    if (!value) {
                                        return Promise.resolve();
                                    }

                                    try {
                                        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/check-email/${value}`);
                                        const data = response.data;

                                        if (data.success && data.email) {
                                            return Promise.reject(new Error('This email is already registered. Please use another email.'));
                                        }

                                        return Promise.resolve();
                                    } catch (e) {
                                        console.error('Network or server error:', e.message);
                                        return Promise.reject(new Error('Error checking email. Please try again.'));
                                    }
                                },
                            }),
                            ]}
                            labelCol={{ span: 24 }}
                        >
                            <Input value={email} onChange={(e) => { setEmail(e.target.value) }} prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Email" />
                        </Form.Item>

                        <Form.Item
                            label="First Name"
                            name="firstname"
                            rules={[{ required: true, message: 'Please input your First Name!' }]}
                            labelCol={{ span: 24 }}

                        >
                            <Input value={firstName} onChange={(e) => { setFirstName(e.target.value) }} placeholder="First Name" />
                        </Form.Item>

                        <Form.Item
                            label="Last Name"
                            name="lastname"
                            rules={[{ required: true, message: 'Please input your Last Name!' }]}
                            labelCol={{ span: 24 }}

                        >
                            <Input value={lastName} onChange={(e) => { setLastName(e.target.value) }} placeholder="Last Name" />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                                { required: true, message: 'Please input your Password!' },
                                { pattern: /.{8,25}/, message: 'Password must be 8-25 characters.' },
                                { pattern: /[A-Z]/, message: 'Password must include at least one uppercase letter.' },
                                { pattern: /[a-z]/, message: 'Password must include at least one lowercase letter.' },
                                { pattern: /\d/, message: 'Password must include at least one number.' }
                            ]}
                            labelCol={{ span: 24 }}
                        >
                            <Input
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                type={visible ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value) }}
                                suffix={
                                    <Button
                                        icon={visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                        onClick={() => setVisible(!visible)}
                                        size="small"
                                        type="text"
                                    />
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            label="Confirm Password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value) }}
                            rules={[{ required: true, message: 'Please confirm your Password!' }, ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                },
                            })]}
                            labelCol={{ span: 24 }}
                        >
                            <Input prefix={<LockOutlined className="site-form-item-icon" />} type="password" placeholder="Confirm Password" />
                        </Form.Item>

                        {/* <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>Remember me</Checkbox>
                        </Form.Item> */}

                        <Form.Item className='flex justify-center items-center'>
                            <Button type="primary" htmlType="submit" className="register-form-button">
                                Register
                            </Button>
                        </Form.Item>
                        <Modal
                            title="Registration Successful"
                            visible={isModalVisible}
                            onOk={() => { onConfirmRegister(); setIsModalVisible(false) }}
                            onCancel={() => setIsModalVisible(false)}
                        >
                            <p>Are you sure to register?</p>
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
                </div>
            </div>
            <div className='w-1/4 w14'></div>
            <div className="w-1/4 w14 bg-[#4E70C8]">
                <img src='/images/Group 2052.png'></img>
            </div>
        </div>
    );
};

export default Register;
