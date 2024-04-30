const { web3, loadBlockchainData, transporter } = require('../connection');
const { TopicModel } = require('../model/topic');
let votingSystem;
async function initialize() {
    const { VotingSystem } = await loadBlockchainData();
    votingSystem = VotingSystem;
}
initialize();
const getTopics = async () => {
    const totalTopics = await votingSystem.methods.getTotalTopics().call();
    const topicPromises = [];
    const topic = await TopicModel.find({});

    for (let i = 0; i < totalTopics; i++) {
        const uuid = await votingSystem.methods.topicIds(i).call();
        // console.log(topic)
        // if (!topics[i]) {
        //   console.error(`Topic ${i} is undefined.`);
        //   continue; // Skip this iteration
        // }
        topicPromises.push(
            votingSystem.methods.getTopic(uuid).call().then(topicData => {
                return {
                    id: uuid,
                    title: topic[i].title,
                    description: topic[i].description,
                    name: topic[i].name,
                    image: topicData.newtitle[1],
                    durationType: topicData.newtitle[2],
                    createdBy: topicData.newtitle[3],
                    link: topicData.newtitle[4],
                    pin: topic[i].pin.map(pinData => ({
                        voteKey: pinData.voteKey,
                        voteWeight: pinData.voteWeight,
                        votedBy: pinData.votedBy
                    })),
                    startDate: topic[i].startDate,
                    endDate: topic[i].endDate,
                    ballotType: topicData.newtitle[5],
                    invitationType: topicData.newtitle[6],
                    choices: topicData.newtitle[7].map(choiceData => ({
                        choice: choiceData[0],
                        score: choiceData[1],
                        voters: choiceData[2]
                    })),
                    emailList: topicData.newtitle[8].map(emailData => ({
                        email: emailData[0],
                        firstName: emailData[1],
                        lastName: emailData[2],
                        voteWeight: emailData[3],
                        voteKey: emailData[4],
                        voteTime: emailData[5]
                    })),
                    pollStatus: topicData.newtitle[9],
                };
            })
        );
    }
    const topics = await Promise.all(topicPromises);
    return topics
};

const getTopicsEmail = async (email) => {
    const topicUUIDs = await votingSystem.methods.getTopicsByEmail(email).call();

    const mongoTopicsPromise = TopicModel.find({
        uuid: { $in: topicUUIDs },
        createdByMongo: email
    });

    const blockchainTopicsPromise = Promise.all(
        topicUUIDs.map(uuid =>
            votingSystem.methods.getTopic(uuid).call()
        )
    );

    const [mongoTopics, blockchainTopics] = await Promise.all([mongoTopicsPromise, blockchainTopicsPromise]);

    const mongoTopicsMap = mongoTopics.reduce((acc, topic) => {
        acc[topic.uuid] = topic;
        return acc;
    }, {});

    const mergedTopics = blockchainTopics.map((topicData, index) => {
        const uuid = topicUUIDs[index];
        const mongoTopic = mongoTopicsMap[uuid];
        return {
            id: uuid,
            title: mongoTopic.title,
            description: mongoTopic.description,
            name: mongoTopic.name,
            image: topicData.newtitle.image,
            durationType: topicData.newtitle.durationType,
            createdBy: topicData.newtitle.createdBy,
            link: topicData.newtitle.link,
            pin: mongoTopic.pin.map(pinData => ({
                voteKey: pinData.voteKey,
                voteWeight: pinData.voteWeight,
                votedBy: pinData.votedBy
            })),
            startDate: mongoTopic.startDate,
            endDate: mongoTopic.endDate,
            ballotType: topicData.newtitle.ballotType,
            invitationType: topicData.newtitle.invitationType,
            choices: topicData.newtitle.choices.map(choiceData => ({
                choice: choiceData.choice,
                score: choiceData.score,
                voters: choiceData.voters
            })),
            emailList: topicData.newtitle.emailList.map(emailData => ({
                email: emailData.email,
                firstName: emailData.firstName,
                lastName: emailData.lastName,
                voteWeight: emailData.voteWeight,
                voteKey: emailData.voteKey,
                voteTime: emailData.voteTime
            })),
            pollStatus: topicData.newtitle.pollStatus,
        };
    });

    return mergedTopics;
};

async function getTopicByEmail(request, reply) {
    try {
        const { email } = request.query;
        topics = await getTopicsEmail(email)
        reply.send({ success: true, topics });
    } catch (e) {
        console.error('Error:', e.message);
        reply.send({ success: false, error: e.message });
    }
}
async function getUserByTopicId(request, reply) {
    try {
        const { linkId } = request.params;
        const topicData = await votingSystem.methods.getTopic(linkId).call();
        reply.send({
            success: true,
            topic:
            {
                emailList: topicData.newtitle[8].map(emailData => ({
                    email: emailData[0],
                    firstName: emailData[1],
                    lastName: emailData[2]
                })),
            }
        });
    } catch (e) {
        console.error('Error:', e.message);
        reply.send({ success: false, error: e.message });
    }
}

async function getTopicByTopicId(request, reply) {
    try {
        const { linkId } = request.params;
        const topicData = await votingSystem.methods.getTopic(linkId).call();
        const topic = await TopicModel.findOne({ uuid: linkId });
        reply.send({
            success: true,
            topic:
            {
                id: linkId,
                title: topic.title,
                description: topic.description,
                name: topic.name,
                image: topicData.newtitle[1],
                durationType: topicData.newtitle[2],
                createdBy: topicData.newtitle[3],
                link: topicData.newtitle[4],
                pin: topic.pin.map(pinData => ({
                    voteKey: pinData.voteKey,
                    voteWeight: pinData.voteWeight,
                    votedBy: pinData.votedBy
                })),
                startDate: topic.startDate,
                endDate: topic.endDate,
                ballotType: topicData.newtitle[5],
                invitationType: topicData.newtitle[6],
                choices: topicData.newtitle[7].map(choiceData => ({
                    choice: choiceData[0],
                    score: choiceData[1],
                    voters: choiceData[2]
                })),
                emailList: topicData.newtitle[8].map(emailData => ({
                    email: emailData[0],
                    firstName: emailData[1],
                    lastName: emailData[2],
                    voteWeight: emailData[3],
                    voteKey: emailData[4],
                    voteTime: emailData[5]
                })),
                pollStatus: topicData.newtitle[9],
            }
        });
    } catch (e) {
        console.error('Error:', e.message);
        reply.send({ success: false, error: e.message });
    }
}

async function addNewUserToPoll(request, reply) {
    const { pollId, newUser, createdBy, link } = request.body;
    const accounts = await web3.eth.getAccounts();
    // console.log(newUser)
    try {
        const receipt = await votingSystem.methods.addUserToPoll(pollId, newUser).send({ from: accounts[0] });
        const mailOptions = {
            from: createdBy,
            to: newUser.email,
            subject: 'You have been invited to join Vote Poll',
            html: `
        <html>
        <head>
          <style>
            /* Add CSS styles for better appearance */
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 5px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #333;
            }
            /* Define button style */
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #007bff; /* Button background color */
              color: #fff; /* Button text color */
              text-decoration: none; /* Remove underline from the link text */
              border-radius: 5px; /* Rounded corners */
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to Devote Voting Platform</h1>
            <p>Hello ${newUser.firstName} ${newUser.lastName},</p>
            <p>Your vote key is: ${newUser.voteKey}</p>
            <!-- Button linking to the vote page -->
            <a class="button" href="${link}">Vote Now</a>
            <p>Thank you for being a part of our community!</p>
          </div>
        </body>
        </html>        
      `,
        };
        const mailPromise = new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Email error:', error);
                    emailError = error;
                    reject(error);
                } else {
                    // console.log('Email sent:', info.response);
                    resolve(info);
                }
            });
        });
        await Promise.all([mailPromise])

        if (receipt.status) {
            reply.send({ success: true });
        } else {
            reply.send({ success: false, error: 'Blockchain transaction failed' });
        }
    } catch (error) {
        console.error('Blockchain interaction error:', error);
        reply.code(500).send({ success: false, error: 'Internal server error' });
    }
}
const generateAlphaNumericPin = () => {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pin = "";
    for (let i = 0; i <= 49; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        pin += chars[randomIndex];
    }
    return pin;
};
const generatePinsForVoters = (numOfVoters) => {
    const newPins = [];
    for (let i = 0; i < numOfVoters; i++) {
        const pinObject = {
            voteKey: generateAlphaNumericPin(),
            voteWeight: "1",
            votedBy: "Not used"
        };
        newPins.push(pinObject);
    }
    return newPins;
};
async function addNewPinToPoll(request, reply) {
    const { pollId, addPinsValue } = request.body
    try {
        const addpins = generatePinsForVoters(addPinsValue)
        const topic = await TopicModel.findOne({ uuid: pollId })
        const newtopic = await TopicModel.findOneAndUpdate({ uuid: pollId }, {
            pin: [...topic.pin, ...addpins]
        }, { new: true });
        reply.send({ success: true })
    } catch (error) {
        console.error("Error saving to MongoDB:", error);
        reply.send({ success: false })
    }
}
async function addTopic(request, reply) {
    const newTitle = JSON.parse(request.body.newTitle);
    const filePath = request.file.path;
    // console.log(filePath)
    let emailError = null;
    const pins = newTitle.invitationType === "email" ? [] : newTitle.invitationType === "pincode" ? generatePinsForVoters(newTitle.numVote) : undefined;
    newTitle.image = filePath
    delete newTitle.numVote

    const topicData = {
        uuid: newTitle.id,
        title: newTitle.title,
        description: newTitle.description,
        name: newTitle.name,
        startDate: newTitle.startDate,
        endDate: newTitle.endDate,
        createdByMongo: newTitle.createdByMongo,
        pin: pins,
    };
    try {
        const topic = new TopicModel(topicData);
        await topic.save();
        const objectId = topic._id.toString();
        newTitle.mongoId = objectId;
        // console.log(objectId);
    } catch (error) {
        console.error("Error saving to MongoDB:", error);
    }
    const blockchainNewTitle = { ...newTitle };
    delete blockchainNewTitle.pin;
    try {
        const accounts = await web3.eth.getAccounts();
        const estimatedGas = await votingSystem.methods
            .addTopic(blockchainNewTitle.id, blockchainNewTitle)
            .estimateGas({ from: accounts[0] });
        const gasBuffer = Math.floor(estimatedGas * 0.2);
        const blockchainTxPromise = votingSystem.methods
            .addTopic(blockchainNewTitle.id, blockchainNewTitle)
            .send({ from: accounts[0], gas: estimatedGas + gasBuffer })
            .on('transactionHash', (hash) => {
                console.log(`Create Poll Transaction hash: ${hash}`);
            });
        if (blockchainNewTitle.emailList != []) {
            const emailPromises = blockchainNewTitle.emailList.map(async (recipient) => {
                const mailOptions = {
                    from: blockchainNewTitle.createdBy,
                    to: recipient.email,
                    subject: 'You have been invited to join Vote Poll',
                    html: `
        <html>
        <head>
          <style>
            /* Add CSS styles for better appearance */
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 5px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #333;
            }
            /* Define button style */
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #007bff; /* Button background color */
              color: #fff; /* Button text color */
              text-decoration: none; /* Remove underline from the link text */
              border-radius: 5px; /* Rounded corners */
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to Devote Voting Platform</h1>
            <p>Hello ${recipient.firstName} ${recipient.lastName},</p>
            <p>Your vote key is: ${recipient.voteKey}</p>
            <!-- Button linking to the vote page -->
            <a class="button" href="${blockchainNewTitle.link}">Vote Now</a>
            <p>Thank you for being a part of our community!</p>
          </div>
        </body>
        </html>        
      `,
                };

                return new Promise((resolve, reject) => {
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error('Email error:', error);
                            emailError = error;
                            reject(error);
                        } else {
                            // console.log('Email sent:', info.response);
                            resolve(info);
                        }
                    });
                });
            })



            await Promise.all([blockchainTxPromise, ...emailPromises]);
        };
        // console.log('Topic added successfully');
    } catch (e) {
        app.log.error('Error:', e.message);
        emailError = e;
        reply.send({ success: false, error: e.message });
    }

    if (emailError) {

        console.error('Email sending error:', emailError);
        reply.code(500).send({ success: false, error: 'Failed to send emails' });
    } else {

        reply.send({ success: true });
    }
}
async function updateTopicByTopicId(request, reply) {
    const topicId = request.params.id
    // console.log(request.body)
    try {
        const topic = await TopicModel.findOneAndUpdate({ uuid: topicId }, {
            title: request.body.title,
            description: request.body.description,
            name: request.body.name,
            startDate: request.body.startDate,
            endDate: request.body.endDate,
        }, { new: true });
        // console.log(topic)
        reply.send({ success: true })
    } catch (error) {
        console.error("Error saving to MongoDB:", error);
        reply.send({ success: false })
    }
}
async function getTopicByEmailThatVoted(request, reply) {
    try {
        const { email } = request.params;
        topics = await getTopics()
        filterdTopics = topics.filter((topic) => {
            if (topic.invitationType == "pincode") {
                return !!(topic.pin.filter((pin1) => {
                    return pin1.votedBy == email
                })).length > 0
            } else if (topic.invitationType == "email") {
                return !!(topic.emailList.filter((email1) => {
                    return email1.email == email && email1.voteWeight == 0
                })).length > 0
            }
        })
        reply.send({ success: true, topics: filterdTopics });
    } catch (e) {
        console.error('Error:', e.message);
        reply.send({ success: false, error: e.message });
    }
}
module.exports = { getTopicByEmail, getUserByTopicId, getTopicByTopicId, addNewUserToPoll, addNewPinToPoll, addTopic, updateTopicByTopicId, getTopicByEmailThatVoted };