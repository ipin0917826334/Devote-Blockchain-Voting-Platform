import React, { useState, useEffect, useMemo, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Button, Input, message, Image, Modal, Spin, Pagination, Space, DatePicker } from "antd";
import { RestOutlined } from "@ant-design/icons"
import { CopyOutlined, EditOutlined, CheckOutlined, ReloadOutlined } from "@ant-design/icons";
import { jsPDF } from "jspdf";
import VoteSteps from "./VoteSteps";
import axios from 'axios';
import "jspdf-autotable";
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import utc from 'dayjs/plugin/utc';
import { useTopics } from './TopicsContext';
dayjs.extend(utc);
const Vote = ({ topics1 }) => {
  const navigate = useNavigate();
  const { RangePicker } = DatePicker;
  const { topicId } = useParams();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmailList, setFilteredEmailList] = useState([]);
  const [profileList, setProfileList] = useState([]);
  const [emailList, setEmailList] = useState([]);
  const [toggleAddPins, setToggleAddPins] = useState(false);
  const [addPinsValue, setAddPinsValue] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEmailInviteVisible, setIsEmailInviteVisible] = useState(false)
  const { triggerTopicsRefresh } = useTopics();
  const prevTopicIdRef = useRef();
  const prevTopicId = prevTopicIdRef.current;
  const token = localStorage.getItem('token');
  axios.defaults.headers.common['Authorization'] = token;
  const [editMode, setEditMode] = useState({
    title: false,
    description: false,
    name: false,
    startDate: false,
    endDate: false,
  });
  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users`);
      if (response.data.success) {
        const newEmailList = response.data.users.map(user => ({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          voteWeight: 1,
          voteKey: uuidv4(),
          voteTime: "Not voted"
        }));

        setEmailList(newEmailList);
        setFilteredEmailList(newEmailList);

      } else {
        console.error('Error fetching users:', response.data.error);
      }
    } catch (error) {
      alert(error.message);
    }
  };
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/${topicId}`);
        const data = response.data;
        if (data.success && data.topic) {
          setProfileList(data.topic.emailList);
        } else {
          throw new Error(data.error || 'Unknown error occurred');
        }
      } catch (error) {
        console.error('Error fetching topic:', error);
      }
    };

    fetchTopic();
  }, []);
  useEffect(() => {
    prevTopicIdRef.current = topicId;

    if (prevTopicId !== topicId) {
      setCurrentPage(1);
    }
    return () => {
      prevTopicIdRef.current = null;
    };
  }, [topicId]); 

  const handleSearchInputClick = () => {
    fetchData();
  };
  const handleSearchInputChange = (value) => {
    setSearchQuery(value);
    const filteredList = emailList.filter((user) =>
      user.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredEmailList(filteredList);
  };
  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };
  const handleAddEmailButton = () => {
    setIsEmailInviteVisible(true)
  }
  // Function to confirm the selected user
  const handleConfirmEmailInvite = async () => {
    if (selectedUser) {
      if (!profileList.some((user) => user.email === selectedUser.email)) {
        try {
          const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/update-poll-email-list`, {
            pollId: topicId,
            newUser: selectedUser,
            createdBy: topic.createdBy,
            link: topic.link
          });

          if (response.data.success) {
            setProfileList([...profileList, selectedUser]);
            triggerTopicsRefresh();
            message.success('User added successfully');
          } else {
            message.error('Failed to add user');
          }
        } catch (error) {
          console.error('Error while adding user to poll:', error);
          message.error('An error occurred while adding user');
        }
      } else {
        message.warning('User already in the list');
      }
    }

    // Reset selected user and close the modal
    setSelectedUser(null);
    setIsEmailInviteVisible(false);
  };
  const handleRefetchClick = () => {
    triggerTopicsRefresh();
  };
  const handleAddPins = async () => {
    if (addPinsValue <= 0) {
      message.error("Pin must be above zero")
      return
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/update-poll-pins`, {
        pollId: topicId,
        addPinsValue: addPinsValue,
      });

      if (response.data.success) {
        // Update profileList state only after successful blockchain update
        triggerTopicsRefresh();
        message.success('Pin added successfully');

      } else {
        message.error('Failed to add Pin');
      }
    } catch (error) {
      console.error('Error while adding pin to poll:', error);
      message.error('An error occurred while adding pin');
    }
  }
  let topic = {};
  const [updatedValues, setUpdatedValues] = useState({
    title: topic.title,
    description: topic.description,
    name: topic.name,
    startDate: new Date(parseInt(topic.startDate)).toLocaleString(),
    endDate: new Date(parseInt(topic.endDate)).toLocaleString(),
  });
  for (var i = 0; i < topics1.length; i++) {
    if (topics1[i].id === topicId) {
      topic = topics1[i];
    }
  }
  const showResults = () => {
    const sumOfScores = topic.choices.reduce((sum, choice) => sum + +choice.score, 0);
    if (sumOfScores === 0) {
      Modal.warning({
        title: 'No Votes',
        content: 'No one has voted yet!',
      });
    } else {
      navigate(`/results/${topic.id}`);
    }
  };
  useEffect(() => {
    triggerTopicsRefresh();
    if (topic.pollStatus === "Open") {
      setVoteStatus("end");
    }
    else {
      setVoteStatus("start");
    }
  }, [topicId]);



  const [voteStatus, setVoteStatus] = useState("start");
  const handleTime = async (status) => {
    setLoading(true);
    if (status === "start") {
      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/pollstatus`, {
          topicId, status: "start"
        });
        if (response.data.success) {
          setVoteStatus("end");
        } else {
          console.error(response.data.error);
        }
      } catch (e) {
        console.error('Error:', e.message);
      }
      finally {
        setLoading(false);
      }
    }
    else {
      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/pollstatus`, {
          topicId, status: "end"
        });
        if (response.data.success) {
          setVoteStatus("start");
        } else {
          console.error(response.data.error);
        }
      } catch (e) {
        console.error('Error:', e.message);
      } finally {
        setLoading(false);
      }
    }
  }
  const toggleEditMode = (field) => {
    setEditMode((prevEditMode) => ({ ...prevEditMode, [field]: !prevEditMode[field] }));

    setUpdatedValues({
      title: topic.title,
      description: topic.description,
      name: topic.name,
      startDate: dayjs(topic.startDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      endDate: dayjs(topic.endDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    });
  };


  const handleUpdate = async (field, value) => {
    let formattedValue = value;
    if (field === 'startDate' || field === 'endDate') {
      formattedValue = dayjs(value).utc().format();
    }

    setUpdatedValues(prev => ({ ...prev, [field]: formattedValue }));

    try {
      const payload = { [field]: formattedValue };
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/update-topic/${topicId}`, payload);
      if (response.data.success) {
        triggerTopicsRefresh();
        setUpdatedValues(prev => ({ ...prev, [field]: formattedValue }));
      } else {
        console.error("Update failed:", response.data.error);
      }
    } catch (e) {
      console.error('Error in handleUpdate:', e.message);
    }

    setEditMode((prevEditMode) => ({ ...prevEditMode, [field]: false }));
  };



  const exportToCSV = (topic) => {
    const rows = [
      ["Num", "Vote Key", "Vote Weight"],
      ...topic.pin.map((pinObj, idx) => [idx + 1, pinObj.voteKey, pinObj.voteWeight]),
    ];

    // Create CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    rows.forEach(function (rowArray) {
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
    });
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pins.csv");
    document.body.appendChild(link);
    link.click();
  };
  const exportToPDF = (topic) => {
    const rows = [
      ["Num", "Vote Key", "Vote Weight"],
      ...topic.pin.map((pinObj, idx) => [idx + 1, pinObj.voteKey, pinObj.voteWeight]),
    ];
    // Create PDF
    const doc = new jsPDF();
    doc.autoTable({
      head: [rows[0]],
      body: rows.slice(1),
    });
    doc.save("pins.pdf");
  };
  const handleCopyLink = (link) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link)
        .then(() => {
          message.success("Link copied to clipboard!");
        })
        .catch((err) => {
          message.error("Failed to copy link!");
          console.error("Could not copy text: ", err);
        });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          message.success("Link copied to clipboard!");
        } else {
          message.error("Failed to copy link!");
        }
      } catch (err) {
        message.error("Failed to copy link!");
        console.error("Could not copy text: ", err);
      }
      document.body.removeChild(textarea);
    }
  };
  const columns = [
    {
      title: "Num",
      dataIndex: "number",
      key: "number",
    },
    {
      title: "Vote Key",
      dataIndex: "voteKey",
      key: "voteKey",
    },
    {
      title: "Vote Weight",
      dataIndex: "voteWeight",
      key: "voteWeight",
    },
    {
      title: "Used By",
      dataIndex: "votedBy",
      key: "votedBy",
    },
  ];

  const dataSource =
    topic && topic.pin
      ? topic.pin.map((pinObj, pinIndex) => ({
        key: pinIndex,
        number: pinIndex + 1,
        voteKey: pinObj.voteKey,
        voteWeight: pinObj.voteWeight,
        votedBy: pinObj.votedBy
      }))
      : [];
  const paginatedDataSource = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return dataSource.slice(startIndex, endIndex);
  }, [dataSource, currentPage, pageSize]);

  return (
    <div className="flex justify-center flex-col mt-10 bg-[#DEE9EF]">
      <VoteSteps stepNow={1} />
      <div className="w-full pl-10 pr-10">
        <div className="border rounded-md p-8 shadow-lg bg-[#FFFFFF]">
          <div className="flex justify-center items-center">
            <Image
              src={`${import.meta.env.VITE_BACKEND_URL}/` + topic.image}
              alt={topic.name}
              width="400px"
              className="rounded-md h-64 object-cover mb-4"
            />
          </div>
          {topic.title && (
            <div className="flex items-center">
              <p className="text-gray-600 text-2xl">Title: </p>
              {editMode.title ? (
                <>
                  <Input
                    value={updatedValues.title}
                    onChange={(e) => setUpdatedValues((prevValues) => ({ ...prevValues, title: e.target.value }))}
                    autoFocus
                    style={{ width: '200px', marginRight: '8px' }}
                  />
                  <Button type="primary" style={{ marginRight: '8px' }} onClick={() => handleUpdate('title', updatedValues.title)}>Save</Button>
                  <Button danger onClick={() => toggleEditMode('title')}>Cancel</Button>
                </>
              ) : (
                <>
                  <span className="text-gray-600 text-2xl">{topic.title}</span>
                  <EditOutlined
                    className="ml-2 cursor-pointer"
                    onClick={() => toggleEditMode('title')}
                  />
                </>
              )}
            </div>
          )}

          {topic.description && (
            <div className="flex items-center pt-10">
              <p className="text-gray-600 text-2xl">Desc: </p>
              {editMode.description ? (
                <>
                  <Input.TextArea
                    value={updatedValues.description}
                    onChange={(e) => setUpdatedValues((prevValues) => ({ ...prevValues, description: e.target.value }))}
                    autoFocus
                    style={{ width: '200px', marginRight: '8px' }}
                  />
                  <Button type="primary" style={{ marginRight: '8px' }} onClick={() => handleUpdate('description', updatedValues.description)}>Save</Button>
                  <Button danger onClick={() => toggleEditMode('description')}>Cancel</Button>
                </>
              ) : (
                <>
                  <span className="text-gray-600 text-2xl">{topic.description}</span>
                  <EditOutlined
                    className="ml-2 cursor-pointer"
                    onClick={() => toggleEditMode('description')}
                  />
                </>
              )}
            </div>
          )}

          {topic.name && (
            <div className="flex items-center pt-10">
              <p className="text-gray-600 text-2xl">Name: </p>
              {editMode.name ? (
                <>
                  <Input
                    value={updatedValues.name}
                    onChange={(e) => setUpdatedValues((prevValues) => ({ ...prevValues, name: e.target.value }))}
                    autoFocus
                    style={{ width: '200px', marginRight: '8px' }}
                  />
                  <Button type="primary" style={{ marginRight: '8px' }} onClick={() => handleUpdate('name', updatedValues.name)}>Save</Button>
                  <Button danger onClick={() => toggleEditMode('name')}>Cancel</Button>
                </>
              ) : (
                <>
                  <span className="text-gray-600 text-2xl">{topic.name}</span>
                  <EditOutlined
                    className="ml-2 cursor-pointer"
                    onClick={() => toggleEditMode('name')}
                  />
                </>
              )}
            </div>
          )}

          {topic.durationType === "schedule" && (
            <>
              <div className="flex items-center pt-10">
                <p className="text-gray-600 text-2xl">Start Date: </p>
                {editMode.startDate ? (
                  <>
                    <DatePicker
                      defaultValue={dayjs(new Date((topic.startDate)))}
                      onChange={(date, dateString) => setUpdatedValues((prevValues) => ({ ...prevValues, startDate: dateString }))}
                      showTime
                      style={{ width: '200px', marginRight: '8px' }}
                    />
                    <Button type="primary" style={{ marginRight: '8px' }} onClick={() => handleUpdate('startDate', updatedValues.startDate)}>Save</Button>
                    <Button danger onClick={() => toggleEditMode('startDate')}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <span className="text-gray-600 text-2xl">
                      {dayjs(topic.startDate).format('YYYY-MM-DD HH:mm:ss')}
                    </span>
                    <EditOutlined
                      className="ml-2 cursor-pointer"
                      onClick={() => toggleEditMode('startDate')}
                    />
                  </>
                )}
              </div>
              <div className="flex items-center pt-10">
                <p className="text-gray-600 text-2xl">End Date: </p>
                {editMode.endDate ? (
                  <>
                    <DatePicker
                      defaultValue={dayjs(new Date((topic.endDate)))}
                      onChange={(date, dateString) => setUpdatedValues((prevValues) => ({ ...prevValues, endDate: dateString }))}
                      showTime
                      style={{ width: '200px', marginRight: '8px' }}
                    />
                    <Button type="primary" style={{ marginRight: '8px' }} onClick={() => handleUpdate('endDate', updatedValues.endDate)}>Save</Button>
                    <Button danger onClick={() => toggleEditMode('endDate')}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <span className="text-gray-600 text-2xl">
                      {dayjs(topic.endDate).format('YYYY-MM-DD HH:mm:ss')}
                    </span>
                    <EditOutlined
                      className="ml-2 cursor-pointer"
                      onClick={() => toggleEditMode('endDate')}
                    />
                  </>
                )}
              </div>
            </>
          )}


          <div className="flex items-center pt-10 w-full md:w-2/3 lg:w-1/2">
            <p className="text-gray-600 text-2xl pr-4">
              Link:
            </p>
            <Input
              value={topic.link}
              disabled={true}
              className="w-full text-black"
            />
            <Button
              icon={<CopyOutlined />}
              onClick={() => handleCopyLink(topic.link)}
              type="text"
            />
          </div>


          {topic.invitationType === "email" ? (
            <>
              <div className="flex items-center pt-10">
                <p className="text-gray-600 text-2xl mr-3">User:</p>
                <Button type="primary" size={"large"} onClick={handleAddEmailButton}>Add Email</Button>
              </div>
              <div className="my-3 overflow-y-auto pt-10">
                <div className="ml-5 float-right mb-3">
                  <Button type="primary" onClick={handleRefetchClick}><span className="mb-2"><ReloadOutlined /></span></Button>
                </div>
                <Table dataSource={topic.emailList} pagination={false} rowKey={(record) => record.email}>
                  <Table.Column title="Email" dataIndex="email" key="email" />
                  <Table.Column title="First Name" dataIndex="firstName" key="firstName" />
                  <Table.Column title="Last Name" dataIndex="lastName" key="lastName" />
                  <Table.Column title="Vote Weight" dataIndex="voteWeight" key="voteWeight" />
                  <Table.Column title="Vote Key" dataIndex="voteKey" key="voteKey" />
                  <Table.Column title="Vote Time" dataIndex="voteTime" key="voteTime" />

                </Table>
              </div>
            </>
          ) : (
            <>
              {/* Pin */}
              <p className="text-gray-600 text-2xl pt-10">
                Pins:
                <Button
                  type="primary"
                  onClick={() => exportToCSV(topic)}
                  className="ml-10"
                >
                  CSV
                </Button>
                <Button
                  type="primary"
                  onClick={() => exportToPDF(topic)}
                  className="ml-4"
                >
                  PDF
                </Button>
                <Input
                  value={addPinsValue}
                  onChange={(e) => setAddPinsValue(e.target.value)}
                  type="number"
                  className={`ml-4 w-40 text-black ${toggleAddPins ? "" : "hidden"}`}
                />
                <Button
                  type="primary"
                  onClick={() => setToggleAddPins(true)}
                  className={`ml-4 ${!toggleAddPins ? "" : "hidden"}`}
                >
                  Add Pins
                </Button>
                <Button
                  type="primary"
                  onClick={() => handleAddPins()}
                  className={`ml-4 ${toggleAddPins ? "" : "hidden"}`}
                >
                  Add
                </Button>
                <Button
                  danger
                  onClick={() => setToggleAddPins(false)}
                  className={`ml-4 ${toggleAddPins ? "" : "hidden"}`}
                >
                  Cancel
                </Button>
              </p>
              <div className="text-gray-600 text-2xl pt-10 p-20">
                <div className="overflow-y-auto border-2" style={{ maxHeight: "300px" }}>
                  <Table
                    dataSource={paginatedDataSource}
                    columns={columns}
                    pagination={false}
                    id={`pin-table-${topic.id}`}
                    className="w-full border-collapse"
                  />
                </div>
                <div className="pagination-container mt-5 flex justify-center">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={dataSource.length}
                    onChange={(page, newPageSize) => {
                      setCurrentPage(page);
                      setPageSize(newPageSize);
                    }}
                  />
                  <div className="ml-5">
                    <Button type="primary" onClick={handleRefetchClick}><span className="mb-2"><ReloadOutlined /></span></Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {topic.durationType === "manual" && (
            <div className="flex items-center justify-center ">
              {voteStatus === "start" && (
                <button
                  type="button"
                  onClick={() => handleTime("start")}
                  className="text-[20px] text-[#00B6DE] flex justify-center mr-5"
                >
                  <div className="bg-[#FFFFFF] border-[3px] border-[#38B56A] text-[#38B56A] rounded-[11px] px-[27px] border-solid flex justify-center items-center py-4 w-[150px]">
                    Start Vote
                  </div>
                </button>
              )}
              {voteStatus === "end" && (
                <button
                  type="button"
                  onClick={() => handleTime("end")}
                  className="text-[20px] text-[#00B6DE] flex justify-center mr-5"
                >
                  <div className="bg-[#FFFFFF] border-[3px] border-[#38B56A] text-[#38B56A] rounded-[11px] px-[27px] border-solid flex justify-center items-center py-4 w-[150px]">
                    End Vote
                  </div>
                </button>
              )}
              <button
                type="button"
                onClick={showResults}
                className="text-[20px] text-[#00B6DE] flex justify-center"
              >
                <div className="bg-[#FFFFFF] border-[3px] border-[#38B56A] text-[#38B56A] rounded-[11px] px-[27px] border-solid flex justify-center items-center py-4 w-[150px]">
                  Result
                </div>
              </button>
            </div>
          )}
          {topic.durationType === "schedule" && (
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={showResults}
                className="text-[20px] text-[#00B6DE] flex justify-center"
              >
                <div className="bg-[#FFFFFF] border-[3px] border-[#38B56A] text-[#38B56A] rounded-[11px] px-[27px] border-solid flex justify-center items-center py-4 w-[150px]">
                  Result
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
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
      <Modal
        title="Search and Select User"
        visible={isEmailInviteVisible}
        onOk={handleConfirmEmailInvite}
        onCancel={() => setIsEmailInviteVisible(false)}
        okText="Add"
        width={800}
      >
        <Input
          placeholder="Search by email"
          onClick={handleSearchInputClick}
          onChange={(e) => handleSearchInputChange(e.target.value)}
          value={searchQuery}
          style={{ marginBottom: "16px" }}
        />
        <div style={{ maxHeight: '300px', overflowY: 'scroll' }}>
          {filteredEmailList.map((user) => (
            <div
              key={user.email}
              onClick={() => handleUserSelect(user)}
              className={`search-result ${selectedUser && selectedUser.email === user.email ? "selected" : ""} border-b-2`}
            >
              <p>{user.email}</p>
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-junge mt-4">User who can vote the poll</h2>
        <div style={{ maxHeight: '300px', overflowY: 'scroll' }}>
          <Table dataSource={profileList} pagination={false} rowKey={(record) => record.email}>
            <Table.Column title="Email" dataIndex="email" key="email" />
            <Table.Column title="First Name" dataIndex="firstName" key="firstName" />
            <Table.Column title="Last Name" dataIndex="lastName" key="lastName" />
            {/* <Table.Column
              title="Remove"
              key="remove"
              render={(text, record) => (
                <Button
                  type="link"
                  onClick={() => handleRemoveUser(record)}
                >
                  <RestOutlined style={{ fontSize: '20px', color: 'red' }} />
                </Button>
              )}
            /> */}
          </Table>
        </div>
      </Modal>
    </div>
  );
};

export default Vote;
