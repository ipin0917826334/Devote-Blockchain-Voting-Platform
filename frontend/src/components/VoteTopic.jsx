import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from './UserContext';
import { useTopics } from './TopicsContext'; 
import axios from 'axios';

const VoteTopic = ({ setTopics1 }) => {
  const { user } = useContext(UserContext);
  const { topics, setTopics, refreshTopics } = useTopics();
  const [loading, setLoading] = useState(true);

  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = token;
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/topics?email=${user.email}`);

      const data = response.data;
      if (data.success && data.topics) {
        setTopics(data.topics);
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics()
    const intervalId = setInterval(fetchTopics, 60000);
    return () => clearInterval(intervalId);
  }, [refreshTopics]);

  useEffect(() => {
    setTopics1(topics);
  }, [topics, setTopics1]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#20414F] font-junge h-screen">
      <div className='pt-0'>
        <Link to="/create">
          <button className="text-[32px] bg-[#20414F] border-[3px] border-[#00B6DE] rounded-[11px] px-[27px] py-4 border-solid flex justify-center items-center text-[#00B6DE]">
            New Vote
          </button>
        </Link>
      </div>

      <div className="flex mt-20 flex-col w-full divide-y divide-[#00B6DE] p-5 mb-[300px]">
        {loading ? (
          <div className="flex text-white justify-center items-center">Loading...</div>
        ) : topics.length > 0 ? (
          topics.map((topic, index) => (
            <Link to={`/vote/${topic.id}`} key={index} className="flex justify-center items-center text-[#FFFFFF] py-3 w-full text-2xl">
              {topic.title}
            </Link>
          ))
        ) : (
          <div className="flex text-white justify-center items-center">No topics available. Please create one.</div>
        )}
      </div>
    </div>
  );
};

export default VoteTopic;
