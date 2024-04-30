import React, { useState, useContext, useEffect } from 'react';
import { Modal } from 'antd';
import { TopicsProvider } from './components/TopicsContext';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import CreateVote from './components/CreateVote';
import VoteTopic from './components/VoteTopic';
import Navbar from './components/Navbar';
import Vote from './components/Vote';
import Result from './components/Result';
import Register from './components/Register'
import Login from './components/Login';
import Join from './components/Join';
import Feedback from './components/Feedback';
import Poll from './components/Poll'
import { UserContext } from './components/UserContext';
import ResultPoll from './components/ResultPoll';
import Home from './components/Home';
import History from './components/History';
import axios from 'axios';

const Layout = ({ setTopics1 }) => {
  const { user } = useContext(UserContext);

  if (user) {
    return (
      <div className="container1 flex font-junge bg-[#20414F]">
        <div className="sidebar w-1/5 bg-[#20414F] flex flex-col">
          <VoteTopic setTopics1={setTopics1} />
        </div>
        <div className="main-content w-4/5 bg-[#DEE9EF] pb-4 z-3 ">
          <Outlet />
        </div>
      </div>
    );
  } else {
    return <>
      <Home />
    </>;
  }
};

const App = () => {
  const [topics, setTopics] = useState([]);
  const [topics1, setTopics1] = useState([]);
  const [topicPoll, setTopicPoll] = useState([]);
  const [history, setHistory] = useState();
  const [topicId, setTopicId] = useState();
  const [selectedChoicesPoll, setSelectedChoicesPoll] = useState([]);
  const [pinFromJoin, setPinFromJoin] = useState();
  const [user, setUser] = useState(null);
  const [hash, setHash] = useState();

  const addVoteTopic = (newTopic) => {
    const updatedTopics = [...topics, newTopic];
    setTopics(updatedTopics);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      axios.defaults.headers.common['Authorization'] = savedToken;
    }

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = token;
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user`);
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, []);
// Make user cant inspect website
  useEffect(() => {
    const handleContextmenu = e => {
      e.preventDefault();
    };
  
    const handleKeyDown = e => {
      if (e.keyCode === 123) { // F12 key
        e.preventDefault();
      }
    };
  
    document.addEventListener('contextmenu', handleContextmenu);
    document.addEventListener('keydown', handleKeyDown);
  
    return () => {
      document.removeEventListener('contextmenu', handleContextmenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  

  return (
    <Router>
      <UserContext.Provider value={{ user, setUser }}>
        <TopicsProvider>
          <Navbar isLoginScreen={true} history={history} topicId={topicId} />
          <Routes>
            <Route path="/" element={<Layout setTopics1={setTopics1} />}>
              <Route path="/create" element={<CreateVote addVoteTopic={addVoteTopic} topics={topics} setHistory={setHistory} />} />
              <Route path="/vote/:topicId" element={<Vote topics1={topics1} />} />
            </Route>
            <Route index element={<Home />} />
            <Route path="/results/:topicId" element={<Result />} />
            <Route path="/feedback" element={<Feedback setHistory={setHistory} />} />
            <Route path="/vote-link/:linkId" element={<Join setTopicPoll={setTopicPoll} setPinFromJoin={setPinFromJoin} setHistory={setHistory} setTopicId={setTopicId} />} />
            <Route path="/poll/:topicId" element={<Poll topicPoll={topicPoll} pinFromJoin={pinFromJoin} setSelectedChoicesPoll={setSelectedChoicesPoll} setHash={setHash} />} />
            <Route path="/resultPoll/:topicId" element={<ResultPoll topicPoll={topicPoll} selectedChoicesPoll={selectedChoicesPoll} hash={hash} />} />
            <Route path="/login" element={<Login history={history} topicId={topicId} />} />
            <Route path="/register" element={<Register />} />
            <Route path='/history' element={<History setHistory={setHistory} />} />
          </Routes>
        </TopicsProvider>
      </UserContext.Provider>
    </Router>
  );
};

export default App;
