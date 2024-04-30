import React, { useState, useCallback, useEffect, useContext } from "react";
import Cropper from "react-easy-crop";
import { v4 as uuidv4 } from "uuid";
import getCroppedImg from "./utility/cropImage";
import { useNavigate } from "react-router-dom";
import {
  Input,
  Button,
  Select,
  DatePicker,
  Image,
  Form,
  Modal,
  Table,
  Spin,
  InputNumber
} from "antd";
import { RestOutlined } from "@ant-design/icons"
import { AiOutlinePlusSquare, AiOutlineCloseSquare } from "react-icons/ai";
import VoteSteps from "./VoteSteps";
import { UserContext } from "./UserContext";
import axios from 'axios';
const { Option } = Select;
const CreateVote = ({ addVoteTopic, setHistory }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [ballotType, setBallotType] = useState("single");
  const [durationType, setDurationType] = useState("manual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [choices, setChoices] = useState([""]);
  const [numVote, setNumVote] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [emailList, setEmailList] = useState([]);
  const [profileList, setProfileList] = useState([]);
  const [invitationType, setInvitationType] = useState("pincode");
  const [isEmailInviteVisible, setIsEmailInviteVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmailList, setFilteredEmailList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [image2Sent, setImage2Sent] = useState(null)
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { user } = useContext(UserContext);
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = token;
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

        // console.log("Email List:", newEmailList);
      } else {
        console.error('Error fetching users:', response.data.error);
      }
    } catch (error) {
      alert(error.message);
    }
  };
  const handleRemoveUser = (userToRemove) => {
    // Filter the profileList to exclude the user to be removed
    const updatedProfileList = profileList.filter(
      (user) => user.email !== userToRemove.email
    );
    setProfileList(updatedProfileList);
  };
  const handleSearchInputClick = () => {
    // Call fetchData when the search input is clicked
    fetchData();
  };
  useEffect(() => {
    // Call fetchData when the component mounts
    setHistory("create")
  }, []);
  const handleSearchInputChange = (value) => {
    setSearchQuery(value);
    // Filter the email list based on the search query
    const filteredList = emailList.filter((user) =>
      user.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredEmailList(filteredList);
  };
  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  // Function to confirm the selected user
  const handleConfirmEmailInvite = () => {
    if (selectedUser) {
      // Check if the selected user is not already in the profileList
      if (!profileList.some((user) => user.email === selectedUser.email)) {
        // Add the selected user to the profileList
        setProfileList([...profileList, selectedUser]);
      }
      // Reset selected user
      setSelectedUser(null);
    }
  };


  const handleChoiceChange = (index, value) => {
    const updatedChoices = [...choices];
    updatedChoices[index] = value;
    setChoices(updatedChoices);
  };

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropping, setCropping] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageChange = async () => {
    const fileInput = document.getElementById("image");
    const file = fileInput.files[0];

    if (!file) {
      // No file was selected
      setIsImageSelected(false);
      return;
    }

    // console.log(file);
    const reader = new FileReader();
    reader.onload = function (event) {
      const base64String = event.target.result;
      setImage(base64String);
    };

    reader.readAsDataURL(file);
    setCropping(true);
    // alert("Add image sucessfully")
    setIsImageSelected(true);
  };
  const blobToFile = (blob) => {
    return new File([blob], `${Math.random().toString().substring(2)}.${blob.type.substring(6)}`, {
      type: blob.type,
      lastModified: Date.now()
    });
  }
  const handleCrop = async () => {
    const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels, 400, 0.5);
    const file = blobToFile(croppedImageBlob);
    setImage2Sent(file);
    const objectURL = URL.createObjectURL(croppedImageBlob);
    setImage(objectURL);
    setCropping(false);
  };
  const showConfirmModal = () => {
    setIsModalVisible(true);
  };

  const handleAddEmailButton = () => {
    setIsEmailInviteVisible(true)
  }

  const handleConfirm = () => {
    setIsModalVisible(false);
    handleSubmit();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAddChoice = () => {
    setChoices([...choices, ""]);
  };
  const initialValues = {
    durationType: "manual",
    ballotType: "single",
    invitationType: "pincode"
  };

  useEffect(() => {
    // console.log("work")
    form.setFieldsValue(initialValues);
  }, []);
  useEffect(() => {
    if (ballotType === "three_vote") {
      setChoices(["Agree", "Against", "Abstain"]);
    } else if (ballotType === "point") {
      setChoices(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
    } else if (ballotType === "single" || ballotType === "multiple") {
      setChoices([""]);
    }
  }, [ballotType]);

  const handleSubmit = async (values) => {
    setLoading(true);
    const uniqueLinkId = uuidv4();
    // console.log(numVote);
    let effectiveStartDate, effectiveEndDate;
    if (durationType === "manual") {
      effectiveStartDate = 0;
      effectiveEndDate = 0;
    } else {
      effectiveStartDate = new Date(startDate).getTime();
      effectiveEndDate = new Date(endDate).getTime();
    }
    let formattedChoices = choices;
    if (ballotType !== "three_vote" || ballotType !== "point") {
      formattedChoices = choices
        .filter((choice) => choice !== "")
        .map((choice) => ({ choice: choice, score: 0, voters: [] }));
    }
    const newTitle = {
      id: uniqueLinkId,
      title: title,
      description: description,
      name: name,
      image: image,
      durationType: durationType,
      createdBy: user.email,
      link: "http://localhost:3000/vote-link/" + uniqueLinkId,
      pin: [],
      startDate: effectiveStartDate,
      endDate: effectiveEndDate,
      ballotType,
      choices: formattedChoices,
      emailList: profileList,
      invitationType: invitationType,
      numVote: numVote,
      pollStatus: "Not Open",
      createdByMongo: user.email,
    };

    const formData = new FormData()
    formData.append("file", image2Sent);
    formData.append("newTitle", JSON.stringify(newTitle));

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/add-topic`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token
        }
      });
      if (response.data.success) {
        // console.log('Topic added successfully:', response.data);
      } else {
        console.error('Error adding topic:', response.data.error);
      }
    } catch (e) {
      console.error('Error:', e.message);
    } finally {
      setLoading(false);
    }
    // console.log(newTitle);
    // allTopics.push(newTitle);
    // localStorage.setItem("topics", JSON.stringify(allTopics));
    addVoteTopic({ topic: title, candidates: [newTitle] });
    setTitle("");
    setDescription("");
    setName("");
    setImage("");
    setStartDate("");
    setEndDate("");
    setBallotType("");
    setChoices([""]);
    setNumVote("");
    // navigate(`/vote/${uniqueLinkId}`);
    window.location.href = `/vote/${uniqueLinkId}`;
    // window.location.reload()
  };
  const handleRemoveChoice = (index) => {
    setChoices((choices) => choices.filter((_, i) => i !== index));
  };


  return (
    <Form
      form={form}
      onFinish={showConfirmModal}
      initialValues={initialValues}
      className="space-y-4 bg-[#DEE9EF] flex flex-col mt-10 font-junge"
    >
      {/* <p className="text-5xl font-thin pl-5">Create Vote</p> */}
      <VoteSteps stepNow={0} />

      <div className="flex-row w-full flex flex-grow font-junge">
        {/* Voting info: title, desc, owner, type, duration */}
        <div className="pl-5 flex-col" style={{ flex: 3 }}>
          <p className="text-5xl font-thin mb-5">Create Vote</p>
          <div className="pl-20">
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Please input your Title!" }]}
              labelCol={{ span: 24 }}
            >
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter Title"
                className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-500 w-full"
              />
            </Form.Item>
            <div className="pt-5">
              <Form.Item
                label="Description"
                name="description"
                rules={[
                  { required: true, message: "Please input your description!" },
                ]}
                labelCol={{ span: 24 }}
              >
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter Description"
                  className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-500 w-full"
                />
              </Form.Item>
            </div>
            <div className="pt-5">
              <Form.Item
                label="Name or Organization"
                name="name"
                rules={[{ required: true, message: "Please input your Name!" }]}
                labelCol={{ span: 24 }}
              >
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Description"
                  className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-500 w-full"
                />
              </Form.Item>
            </div>

            <div className="pt-5 flex">
              <Form.Item
                label="Invitation Type"
                name="invitationType"
                rules={[
                  {
                    required: true,
                    message: "Please select your invitation type!",
                  },
                ]}
                labelCol={{ span: 24 }}
                className="mr-3"
              >
                <Select

                  value={invitationType}
                  onChange={(value) => setInvitationType(value)}
                  className="border border-gray-300 rounded-md  w-full"
                >
                  <Option value="email">Email</Option>
                  <Option value="pincode">Pin Code</Option>
                </Select>
              </Form.Item>
              {(invitationType == "pincode") ?
                <Form.Item
                  type="number"
                  label="Number of people voting"
                  name="numVote"
                  rules={[
                    {
                      required: true,
                      message: "Please input your Number of people voting!",
                    },
                  ]}
                  labelCol={{ span: 24 }}
                  style={{ flex: 1 }}
                >
                  <InputNumber
                    value={numVote}
                    onChange={(value) => setNumVote(value)}
                    // onChange={(e) => setNumVote(e.target.value)}
                    placeholder="Enter Number of people voting"
                    className="border border-gray-300 rounded-md py-1 focus:outline-none focus:ring focus:border-blue-500 w-full"
                    min={1}
                    precision={0}
                  />
                </Form.Item>
                :
                <Form.Item className="flex items-center mt-6" style={{ marginBottom: 0 }}>
                  <Button type="primary" size={"large"} onClick={handleAddEmailButton}>Add Email</Button>
                </Form.Item>

              }

            </div>
            <div className="flex flex-row items-start">
              {/* Select Choice Type single,multiple,agree/against,point */}
              <div className="pt-5 flex-1 mr-4 flex flex-col justify-end">
                <Form.Item
                  label="Ballot Type:"
                  name="ballotType"
                  rules={[
                    {
                      required: true,
                      message: "Please select your ballot type!",
                    },
                  ]}
                  labelCol={{ span: 24 }}
                >
                  <Select
                    value={ballotType}
                    onChange={(value) => setBallotType(value)}
                    className="border border-gray-300 rounded-md  w-full"
                  >
                    <Option value="single">Single choice</Option>
                    <Option value="multiple">Multiple choice</Option>
                    <Option value="three_vote">Agree/Against/Abstain</Option>
                    <Option value="point">Point</Option>
                  </Select>
                </Form.Item>
              </div>
              {/* Select Duration type  manual start end / schedule */}
              <div className="pt-5 flex-1 mr-4 flex flex-col justify-end">
                <Form.Item
                  label="Vote Duration Setting:"
                  name="durationType"
                  rules={[
                    {
                      required: true,
                      message: "Please select your vote duration setting!",
                    },
                  ]}
                  labelCol={{ span: 24 }}
                >
                  <Select
                    value={durationType}
                    onChange={(value) => setDurationType(value)}
                    className="border border-gray-300 rounded-md w-full"
                  >
                    <Option value="manual">Manual</Option>
                    <Option value="schedule">Schedule</Option>
                  </Select>
                </Form.Item>
              </div>
              {/* Select time appear when it schedule type */}
              {durationType === "schedule" && (
                <div className="pt-5 flex-1 mr-4 flex flex-col justify-end">
                  <Form.Item
                    label="Start Date:"
                    name="startDate"
                    rules={[
                      {
                        required: true,
                        message: "Please select your start date!",
                      },
                    ]}
                    labelCol={{ span: 24 }}
                  >
                    <DatePicker
                      showTime
                      onChange={(date, dateString) =>
                        setStartDate(dateString)
                      }
                    />
                  </Form.Item>
                </div>
              )}
              {durationType === "schedule" && (
                <div className="pt-5 flex-1 mr-4 flex flex-col justify-end">
                  <Form.Item
                    label="End Date:"
                    name="endDate"
                    rules={[
                      {
                        required: true,
                        message: "Please select your end date!",
                      },
                    ]}
                    labelCol={{ span: 24 }}
                  >
                    <DatePicker
                      showTime
                      onChange={(date, dateString) => setEndDate(dateString)}
                    />
                  </Form.Item>
                </div>
              )}
            </div>
            {(ballotType === "multiple" || ballotType === "single") ? (
              <div>
                {choices.map((choice, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 mt-0 mb-3"
                  >
                    <div>{index + 1}.</div>
                    <Form.Item
                      name={`choice-${index}`}
                      rules={[
                        {
                          required: true,
                          message: `Please enter choice ${index + 1}!`,
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const currentChoices = choices.filter(
                              (_, idx) => idx !== index
                            );
                            if (currentChoices.includes(value)) {
                              return Promise.reject(
                                new Error("Choices must be unique!")
                              );
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                      className="flex-1"
                    >
                      <div>
                        <Input
                          type="text"
                          size="large"
                          value={choice}
                          onChange={(e) =>
                            handleChoiceChange(index, e.target.value)
                          }
                          placeholder="Enter choice"
                          className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:border-blue-500 mt-5"
                        />
                      </div>
                    </Form.Item>
                    {index === choices.length - 1 ? (
                      <button type="button" onClick={handleAddChoice}>
                        <AiOutlinePlusSquare className="text-blue-500 hover:text-blue-600 w-6 h-6" />
                      </button>
                    ) : choices.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveChoice(index)}
                      >
                        {/* Use an icon for deleting choice */}
                        <AiOutlineCloseSquare className="text-blue-500 hover:text-blue-600 w-6 h-6" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (<>
            </>)}
          </div>
        </div>
        {/* Input for image part of the vote */}
        <div className="pl-20 mt-20" style={{ flex: 2 }}>
          <div>
            <Form.Item
              name="image"
              rules={[
                {
                  validator: (_, value) =>
                    isImageSelected
                      ? Promise.resolve()
                      : Promise.reject(new Error("Please select an image!")),
                },
              ]}
            >
              <input
                type="file"
                id="image"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => document.getElementById("image").click()}
                className="button-class"
              >
                <img src="/images/group-9.png" alt="Upload" />
              </button>
            </Form.Item>
            {/* Crop the image */}
            {cropping && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 9999,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={4 / 3}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                  <button
                    type="button"
                    className="z-50 mt-[350px] bg-[#36ABD1] text-white p-3 rounded-md"
                    onClick={handleCrop}
                  >
                    Crop Image
                  </button>
                </div>
              </div>
            )}
            <div>
              {/* Preview the uploaded/cropped image */}
              {image && !cropping && (
                <Image
                  src={image}
                  alt="Uploaded Preview"
                  style={{ maxWidth: "300px", marginTop: "20px" }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <Form.Item className="flex justify-center">
        <Button
          type="default"
          htmlType="submit"
          style={{
            borderColor: "#38B56A",
            color: "#38B56A",
            paddingLeft: "70px",
            paddingTop: "20px",
            paddingRight: "70px",
            paddingBottom: "20px",
          }}
          className="px-[27px] rounded-[11px] border-[3px] h-full "
        >
          <div className="flex item-center justify-center text-3xl font-junge">
            Create Vote
          </div>
        </Button>
      </Form.Item>
      <Modal
        title="Confirm"
        visible={isModalVisible}
        onOk={handleConfirm}
        onCancel={handleCancel}
        cancelText="Cancel"
        okText="Create"
      >
        <p>Are you sure you want to create this vote?</p>
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
            <Table.Column
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
            />
          </Table>
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
    </Form >
  );
};

export default CreateVote;
