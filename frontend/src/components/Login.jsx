import React, { useState, useContext } from 'react';
import { Form, Input, Button, Checkbox, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { UserContext } from './UserContext';
import axios from 'axios';

const Login = ({ history, topicId }) => {
    const [error, setError] = useState(null);
    const { setUser } = useContext(UserContext);
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const navigate = useNavigate();

    const onFinish = async (values) => {
        if (!values.email || !values.password) {
            alert('Email and password are required.');
            return;
        }
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
                email: values.email,
                password: values.password
            });
    
            if (response.data.success) {
                const token = response.data.token;                
                localStorage.setItem('token', token);
                axios.defaults.headers.common['Authorization'] = token;
                const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user`);
                const loggedInUser = userResponse.data.user;
                
                setUser(loggedInUser);
                
                if (history === "join") {
                    navigate(`/vote-link/${topicId}`);
                } else {
                    navigate("/create");
                }
            } else {
                setError(response.data.error || 'Login failed');
            }
        } catch (error) {
            alert(error.message);
        }
    };
    

    return (
        <div className="flex flex-col md:flex-row h-screen bg-white">
            <div className="w-full md:w-3/4 bg-[#DEE9EF] relative">
                <img src='/images/Vector 22.png' className='img-login w-full h-full' />
                <img src='/images/Group 2055.png' className='img-login absolute top-0 right-0 md:w-auto' />
            </div>
            <div className="w-full md:w-1/4 flex mt-5 md:mt-20 items-center flex-col md:p-10">
                <div className='text-5xl font-inconsolata mb-5'>DeVote</div>
                <div className='text-2xl font-inconsolata mb-5'>Welcome Back</div>
                <div className="login-form-container px-5 md:px-0">
                    {error && <Alert
                        message={error}
                        type="error"
                        closable
                        onClose={() => setError(null)}
                    />}
                    <Form
                        name="normal_login"
                        className="login-form"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                    >
                        <Form.Item
                            name="email"
                            rules={[{ required: true, message: 'Please input your Email!' }]}
                        >
                            <Input prefix={<UserOutlined className="site-form-item-icon" />} value={email} onChange={(e) => { setEmail(e.target.value) }} placeholder="Email" />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Please input your Password!' }]}
                        >
                            <Input
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                type="password"
                                value={password} onChange={(e) => { setPassword(e.target.value) }}
                                placeholder="Password"
                            />
                        </Form.Item>
                        {/* <Form.Item>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>

                        </Form.Item> */}

                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="login-form-button">
                                Log in
                            </Button>
                            Or <a href="/register">register now!</a>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default Login;
