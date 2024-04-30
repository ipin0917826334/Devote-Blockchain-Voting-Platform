import React, { useState, useEffect } from "react";
import { Form, Input, Button, Alert } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
const Join = ({ setTopicPoll, setPinFromJoin, setHistory, setTopicId }) => {
  const [error, setError] = useState(null);
  const [topic, setTopic] = useState({});
  const { linkId } = useParams();

  const navigate = useNavigate();
  const token = localStorage.getItem('token') || null;
  useEffect(() => {
    setHistory("join");
    setTopicId(linkId);
  }, []);
  const onFinish = async (values) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = token;
      const userEmailResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user`);
      const userEmail = userEmailResponse.data.user.email;
      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/join-poll`, {
          linkId: linkId,
          userEmail: userEmail,
          pin: values.password.trim(),
          token: token
        });

        const data = response.data;

        if (data.success) {
          setTopicPoll(data.topic);
          setPinFromJoin(data.topic.pin);
          navigate(`/poll/${data.topic.id}`);
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError("An error occurred while trying to join the poll.");
        console.error('Error joining poll:', error);
      }
    } else {
      setError("You must login first.");
    }
  };


  return (
    <div
      className="flex h-screen bg-white justify-center items-center px-4 sm:px-0"
      style={{
        backgroundImage: "url('/images/image 6.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="bg-[#DEE9EF] p-10 rounded-md w-full sm:w-1/2 md:w-1/3 lg:w-1/4 max-w-xl">
        <img src="/images/Group 2055.png" className="" />
        <div>
          {error && <Alert
            message={error}
            type="error"
            closable
            onClose={() => setError(null)}
          />}
          <Form
            layout="vertical"
            name="normal_login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              label="Enter Your Pin Code"
              name="password"
              rules={[{ required: true, message: "Please Enter your Pin!" }]}
              labelCol={{ span: 24 }}
            >
              <Input type="password" placeholder="Enter Your Pin Code" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button pt-5 pb-5 flex justify-center items-center"
              >
                <div className="font-junge text-xl">Join Poll</div>
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Join;