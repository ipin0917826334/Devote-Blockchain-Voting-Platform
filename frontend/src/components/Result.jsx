import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, Button, Spin } from 'antd';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, PointElement, RadialLinearScale, Title, Legend, Tooltip } from 'chart.js';
import axios from 'axios';
Chart.register(CategoryScale, LinearScale, BarElement, PointElement, RadialLinearScale, Title, Legend, ChartDataLabels, Tooltip);

const Result = ({ selectedChoicesPoll }) => {
  const modernColors = [
    '#1F77B4', '#FF7F0E', '#2CA02C',
    '#D62728', '#9467BD', '#8C564B', '#E377C2', '#7F7F7F', '#BCBD22', '#17BECF',
    '#7F97E2', '#FFBC79', '#3B6D8C', '#C86240', '#948BFF', '#D882A7', '#E1D05E', '#81C0C0', '#B5BED7', '#F4866F',
    '#CC2E2E', '#1C1C1C', '#FFD92F', '#98DF8A', '#FF9896', '#C5B0D5', '#C49C94', '#F7B6D2', '#C7C7C7', '#DBDB8D',
    '#9EDAE5', '#ACD9E5', '#8C8C8C', '#C49C94', '#F7B6D2', '#C7C7C7', '#DBDB8D', '#9EDAE5', '#ACD9E5', '#8C8C8C',
    '#393B79', '#F1D302', '#0ACDFF', '#182A68', '#A0C4FF', '#CC2E2E', '#B5DACA', '#A12A88', '#6A3D9A', '#FD8B25',
    '#FB5072', '#199D8A', '#2B83BA', '#BC5D0A', '#677F95', '#FBA02E', '#D9292B', '#E55896', '#996ED9', '#4775B2',
    '#AABA8E', '#47C4B2', '#D93240', '#DBB6D2', '#A61C74', '#679F46', '#4072A8', '#ADBC88', '#E4E468', '#72D4E5',
    '#9072AF', '#AF79C3', '#2F7D63', '#D1BC46', '#CC6C47', '#8F67B4', '#29A19C', '#A2BBE4', '#DE98AB', '#C9B464',
    '#416ACE', '#DCE4EB', '#F8AF7C', '#E98065', '#F1F6FE', '#8D8D8D', '#E3CE57', '#7F7F7F', '#BCBD22', '#17BECF',
    '#7F97E2', '#FFBC79', '#3B6D8C', '#C86240', '#948BFF', '#D882A7', '#E1D05E', '#81C0C0', '#B5BED7', '#F4866F',
    '#CC2E2E', '#1C1C1C', '#FFD92F', '#98DF8A', '#FF9896', '#C5B0D5', '#C49C94', '#F7B6D2', '#C7C7C7', '#DBDB8D',
    '#9EDAE5', '#ACD9E5', '#8C8C8C', '#C49C94', '#F7B6D2', '#C7C7C7', '#DBDB8D', '#9EDAE5', '#ACD9E5', '#8C8C8C',
    '#393B79', '#F1D302', '#0ACDFF', '#182A68', '#A0C4FF', '#CC2E2E', '#B5DACA', '#A12A88', '#6A3D9A', '#FD8B25',
    '#FB5072', '#199D8A', '#2B83BA', '#BC5D0A', '#677F95', '#FBA02E', '#D9292B', '#E55896', '#996ED9', '#4775B2',
    '#AABA8E', '#47C4B2', '#D93240', '#DBB6D2', '#A61C74', '#679F46', '#4072A8', '#ADBC88', '#E4E468', '#72D4E5',
    '#9072AF', '#AF79C3', '#2F7D63', '#D1BC46', '#CC6C47', '#8F67B4', '#29A19C', '#A2BBE4', '#DE98AB', '#C9B464',
    '#416ACE', '#DCE4EB', '#F8AF7C', '#E98065', '#F1F6FE', '#8D8D8D', '#E3CE57', '#7F7F7F', '#BCBD22', '#17BECF',
    '#7F97E2', '#FFBC79', '#3B6D8C', '#C86240', '#948BFF', '#D882A7', '#E1D05E', '#81C0C0', '#B5BED7', '#F4866F',
    '#CC2E2E', '#1C1C1C', '#FFD92F', '#98DF8A', '#FF9896', '#C5B0D5', '#C49C94', '#F7B6D2', '#C7C7C7', '#DBDB8D',
    '#9EDAE5', '#ACD9E5', '#8C8C8C', '#C49C94', '#F7B6D2', '#C7C7C7', '#DBDB8D', '#9EDAE5', '#ACD9E5', '#8C8C8C',
    '#393B79', '#F1D302', '#0ACDFF', '#182A68', '#A0C4FF', '#CC2E2E', '#B5DACA', '#A12A88', '#6A3D9A', '#FD8B25',
    '#FB5072', '#199D8A', '#2B83BA'
  ];
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [labels, setLabels] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ballotType, setBallotType] = useState();
  const [pins, setPins] = useState([])
  const [emailList, setEmailList] = useState([])
  const [invitationType, setInvitationType] = useState("")
  const [mean, setMean] = useState(0);
  const [totalScoreVote, setTotalScoreVote] = useState(0);
  const navigate = useNavigate();

  const fetchTopic = async () => {
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = token;
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/topic/` + topicId);
      const data = response.data;
      if (data.success) {
        setTopic(data.topic);
        setLoading(false);
      } else {
        console.error('Error fetching topic:', data.error);
      }
    } catch (e) {
      console.error('Network or server error:', e.message);
    }
  };

  useEffect(() => {
    fetchTopic();
    const timer = setInterval(fetchTopic, 30000);
    return () => clearInterval(timer);
  }, []);



  useEffect(() => {
    const currentTopic = topic ? topic : null;
    if (currentTopic) {
      const formattedData = currentTopic.choices
        ? currentTopic.choices.map(item => ({
          choice: item.choice,
          score: parseInt(item.score, 10),
        }))
        : [];
      const lab = formattedData.map(item => item.choice);
      const sco = formattedData.map(item => item.score);
      setLabels(lab);
      setScores(sco);
      setTitle(currentTopic.title);
      setDescription(currentTopic.description);
      setName(currentTopic.name);
      setPins(currentTopic.pin)
      setEmailList(currentTopic.emailList)
      setInvitationType(currentTopic.invitationType)
      setBallotType(currentTopic.ballotType)
    }
    if (currentTopic && currentTopic.ballotType === "point") {
      const totalSum = currentTopic.choices.reduce((sum, choice) => {
        return sum + (Number(choice.choice) * Number(choice.score));
      }, 0);
      const totalNum = currentTopic.choices.reduce((sum, choice) => {
        return sum + (Number(choice.score));
      }, 0);
      const average = totalSum / totalNum;
      setMean(average);
      setTotalScoreVote(totalSum);
    }
  }, [topic, topicId]);

  const barData = {
    labels: labels,
    datasets: [
      {
        label: 'จํานวนคนโหวต',
        data: scores,
        backgroundColor: modernColors,
        borderColor: modernColors,
        borderWidth: 2,
        hoverOffset: 4,
        borderRadius: 5,
        barPercentage: 0.7,
      },
    ],
  };

  const totalScore = invitationType == "pincode" ? pins.reduce((acc, cur) => cur.voteWeight == 0 ? acc + 1 : acc, 0) : emailList.reduce((acc, cur) => cur.voteWeight == 0 ? acc + 1 : acc, 0)
  const voter = invitationType === "pincode" ? pins.length : emailList.length
  const pieData = {
    labels: labels,
    datasets: [
      {
        label: 'จํานวนคนโหวต',
        data: scores,
        backgroundColor: modernColors,
        borderColor: modernColors,
        borderWidth: 2,
        hoverOffset: 4,
        borderRadius: 5,
      },
    ],
  };

  const BarOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 16,
            family: 'Arial',
            color: 'black',
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 16,
            family: 'Arial',
            color: 'black',
          },
        },
      },
    },
    plugins: {
    },
    animation: {
      duration: 700,
      easing: 'easeOut',
      animateRotate: true,
      animateScale: false,
    },
  };
  const PieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: {
            size: 16,
            family: 'Arial',
            color: 'black',
          },
        },
      },
      datalabels: {
        display: false,
      },
      tooltips: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = ((value / totalScore) * 100).toFixed(2);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOut',
      animateRotate: true,
      animateScale: false,
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: 'white',
      },
    },
    width: 600,
    height: 600,
  };
  useEffect(() => {
    document.body.style.backgroundColor = '#DEE9EF';
  }, []);
  if (loading) {
    return <div className='flex justify-center items-center center bg-[#DEE9EF] h-screen'><Spin size="large" tip="Loading..." /></div>;
  }
  else {
    return (
      <div className="flex h-screen bg-[#DEE9EF] flex-col-reverse md:flex-row justify-center items-center px-4 sm:px-0 pt-20 md:pt-[300px]">
        <div className="flex flex-col bg-white p-4 md:p-20 pt-0 rounded-md w-full md:w-2/3 max-w-3xl shadow-2xl mx-4">
          <p className="text-3xl md:text-5xl font-thin mb-5 pt-5">Result</p>
          <div className='text-xl md:text-2xl align-left p-3'>
            Title: {title}
          </div>
          <div className='text-xl md:text-2xl align-left p-3'>
            Description: {description}
          </div>
          {ballotType === "point" && (
            <>
              <div className='text-xl md:text-2xl align-left p-3'>
                Total Score: {totalScoreVote}
              </div>
              <div className='text-xl md:text-2xl align-left p-3'>
                Mean: {mean}
              </div>
            </>
          )}
          <div className='flex-col md:flex-row'>
            <div className="p-4">
              <Bar key={"voteBarChart"} data={barData} options={{
                ...BarOptions, plugins: {
                  legend: {
                    display: false,
                  },
                  datalabels: {
                    color: 'white',
                    anchor: 'end',
                    align: 'start',
                    offset: 4,
                    font: {
                      size: 20,
                      family: 'junge',
                    },
                    formatter: (value, context) => {
                      const percentage = ((value / totalScore) * 100).toFixed(2);
                      return `${percentage}%`;
                    },
                  },
                },
              }} />
            </div>
            <div className="p-4">
              <div className="p-4">
                <Doughnut
                  data={pieData}
                  options={{
                    ...PieOptions, plugins: {
                      datalabels: {
                        color: 'white',
                        anchor: 'end',
                        align: 'start',
                        offset: 15,
                        font: {
                          size: 16,
                          family: 'junge',
                        },
                        formatter: (value, context) => {
                          const percentage = ((value / totalScore) * 100).toFixed(2);
                          return `${percentage}%`;
                        },
                      },
                    },
                  }}
                  style={{ width: '400px', height: '400px' }}
                />
              </div>
            </div>
          </div>
          <div className='flex justify-end font-junge text-xl' >
            Poll By {name}
          </div>
          <div className='flex justify-center items-center mt-4'>
            <Button onClick={() => navigate(-1)} className='bg-green-400 w-full md:w-2/3 p-4 md:p-6 flex items-center justify-center'>
              <p className='text-xl md:text-2xl font-junge'>Go back to vote</p>
            </Button>
          </div>
        </div>

        {/* New right-side column */}
        <div className="vote-box-wrapper flex flex-row md:block md:self-start w-full md:w-auto bg-black bg-opacity-40 text-white p-4 rounded-lg mx-4 mb-4 md:mb-0 justify-center mt-20">
          <div className="vote-box bg-green-400 h-16 w-[150px] rounded-md flex items-center pl-3 mr-4 md:mr-0">
            <div className='flex justify-start'>
              <p className='text-2xl'>Voter : {voter}</p>
            </div>
          </div>
          <div className="vote-box bg-orange-400 h-16 w-[150px] rounded-md flex items-center pl-3 mt-4 md:mt-5">
            <div className='flex justify-start'>
              <p className='text-2xl'>Voted : {totalScore}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Result;
