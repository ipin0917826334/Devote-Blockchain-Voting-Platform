const { web3, loadBlockchainData, transporter } = require('../connection');
const { TopicModel } = require('../model/topic');
const { ObjectId } = require('mongoose').Types;
const cron = require('node-cron');
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
async function updatePollStatusBySchedule(request, reply) {
    cron.schedule('*/10 * * * * *', async () => {
        try {
            const accounts = await web3.eth.getAccounts();
            // console.log('running a task every minute');
            topics = await getTopics();
            const currentTime = Date.now();
            for (let i = 0; i < topics.length; i++) {

                if (topics[i].durationType === "manual") {
                    // console.log("skip " + topics[i].id + " " + topics[i].durationType)
                    continue;
                }
                function convertDateFormatToUnix(dateString) {
                    const date = new Date(dateString);
                    const unixTimestamp = Math.floor(date.getTime() / 1000); // Convert to seconds
                    return unixTimestamp * 1000; // Convert to milliseconds
                }
                startDateUnix = convertDateFormatToUnix(topics[i].startDate);
                endDateUnix = convertDateFormatToUnix(topics[i].endDate)
                // console.log(startDateUnix, currentTime);
                // console.log( topics[i].id, topics[i])
                if (startDateUnix < currentTime && topics[i].pollStatus === "Not Open" && endDateUnix > currentTime) {
                    // console.log(topics[i].id, "Set to open")
                    const estimatedGas = await votingSystem.methods.updateStatus(
                        topics[i].id, "Open"
                    ).estimateGas({ from: accounts[0] });
                    const gasLimit = Math.floor(estimatedGas * 1.2); // Add 20% buffer

                    const receipt = await votingSystem.methods.updateStatus(
                        topics[i].id, "Open"
                    ).send({ from: accounts[0], gas: gasLimit });
                    // console.log('Status transaction receipt:', receipt);
                    if (receipt.status) {
                        // console.log("Update Status successfully");
                        // reply.send({ success: true });
                    } else {
                        console.error('Transaction failed', receipt);
                        // reply.send({ success: false, error: 'Transaction failed' });
                    }
                }
                else if ((endDateUnix < currentTime || startDateUnix > currentTime) && topics[i].pollStatus === "Open") {
                    console.log(topics[i].id, "Set to not open")
                    const estimatedGas = await votingSystem.methods.updateStatus(
                        topics[i].id, "Not Open"
                    ).estimateGas({ from: accounts[0] });
                    const gasLimit = Math.floor(estimatedGas * 1.2); // Add 20% buffer

                    const receipt = await votingSystem.methods.updateStatus(
                        topics[i].id, "Not Open"
                    ).send({ from: accounts[0], gas: gasLimit });
                    // console.log('Status transaction receipt:', receipt);

                    if (receipt.status) {
                        console.log("Update Status successfully");
                        // reply.send({ success: true });
                    } else {
                        console.error('Transaction failed', receipt);
                        // reply.send({ success: false, error: 'Transaction failed' });
                    }
                }
            }
        } catch (e) {
            console.error('Error:', e.message);
            // reply.send({ success: false, error: e.message });
        }
    });
}
async function updatePollStatusByManual(request, reply) {
    try {
        const accounts = await web3.eth.getAccounts();
        const { topicId, status } = request.body;
        // console.log(status)
        if (status === "start") {
            const estimatedGas = await votingSystem.methods.updateStatus(
                topicId, "Open"
            ).estimateGas({ from: accounts[0] });
            const gasLimit = Math.floor(estimatedGas * 1.2);

            const receipt = await votingSystem.methods.updateStatus(
                topicId, "Open"
            ).send({ from: accounts[0], gas: gasLimit });
            console.log('Status transaction receipt:', receipt);

            if (receipt.status) {
                console.log("Update Status successfully");
                reply.send({ success: true });
            } else {
                console.error('Transaction failed', receipt);
                reply.send({ success: false, error: 'Transaction failed' });
            }
        }
        else {
            const estimatedGas = await votingSystem.methods.updateStatus(
                topicId, "Not Open"
            ).estimateGas({ from: accounts[0] });
            const gasLimit = Math.floor(estimatedGas * 1.2);

            const receipt = await votingSystem.methods.updateStatus(
                topicId, "Not Open"
            ).send({ from: accounts[0], gas: gasLimit });
            console.log('Status transaction receipt:', receipt);

            if (receipt.status) {
                console.log("Update Status successfully");
                reply.send({ success: true });
            } else {
                console.error('Transaction failed', receipt);
                reply.send({ success: false, error: 'Transaction failed' });
            }
        }
    } catch (e) {
        console.error('Error:', e.message);
        reply.send({ success: false, error: e.message });
    }
}
async function joinPoll(request, reply) {
    const { linkId, userEmail, pin } = request.body;

    try {
        const topicMongo = await TopicModel.findOne({ uuid: linkId });
        if (!topicMongo) {
            return reply.code(404).send({ success: false, error: 'Topic not found in MongoDB.' });
        }

        const topicBlockchain = await votingSystem.methods.getTopic(linkId).call();
        if (!topicBlockchain) {
            return reply.code(404).send({ success: false, error: 'Topic not found in blockchain.' });
        }

        // Check if poll is open
        const pollStatus = topicBlockchain.newtitle[9];
        if (pollStatus !== "Open") {
            return reply.send({ success: false, message: "Poll is not open yet." });
        }

        if (!userEmail) {
            return reply.send({ success: false, message: "You must log in first." });
        }

        // Eligibility check
        let eligible = false;
        let message = "";
        let pinObjectId;

        if (topicBlockchain.newtitle[6] === "pincode") {
            const hasPin = topicMongo.pin.find(item => item.voteKey === pin.trim() && item.voteWeight === 1);
            const checkEmail = topicMongo.pin.some(item => item.votedBy === userEmail);
            if (hasPin && !checkEmail) {
                eligible = true;
                pinObjectId = hasPin._id.toString();
                // console.log(pinObjectId)
            } else {
                message = "Incorrect PIN or you have already voted.";
            }
        } else if (topicBlockchain.newtitle[6] === "email") {
            const validUser = topicBlockchain.newtitle[8].some(emailData =>
                emailData[0] === userEmail.trim() &&
                emailData[4] === pin.trim() &&
                Number(emailData[3]) === 1
            );
            if (validUser) {
                eligible = true;
            } else {
                message = "Incorrect PIN or it's not your key.";
            }
        } else {
            message = "Invalid invitation type.";
        }

        if (!eligible) {
            return reply.send({ success: false, message });
        }

        const combinedTopicDetails = {
            id: linkId,
            title: topicMongo.title,
            description: topicMongo.description,
            name: topicMongo.name,
            image: topicBlockchain.newtitle[1],
            ballotType: topicBlockchain.newtitle[5],
            invitationType: topicBlockchain.newtitle[6],
            choices: topicBlockchain.newtitle[7].map(choiceData => ({
                choice: choiceData[0],
                score: choiceData[1],
                voters: choiceData[2]
            })),
            pollStatus: pollStatus,
            pin: pin,
            pinObjectId: pinObjectId
        };

        reply.send({
            success: true,
            message: "Eligible to join the poll.",
            topic: combinedTopicDetails
        });

    } catch (error) {
        console.error('Error:', error.message);
        reply.code(500).send({ success: false, error: error.message });
    }
}
async function vote(request, reply) {
    try {
        const accounts = await web3.eth.getAccounts();
        const { topicId, userEmail, choices, pin, invitationType, voteTime, pinId } = request.body;
        // console.log("bidy" + pinId)
        const topicData = await votingSystem.methods.getTopic(topicId).call();
        const _id = new ObjectId(topicData.newtitle[10]);
        const pinObjectId = new ObjectId(pinId);
        // console.log("topic " + _id)
        if (invitationType === "pincode") {
          try {
            // console.log("pin " + pinObjectId)
            const topic = await TopicModel.findOne({ _id: _id, 'pin._id': pinObjectId, 'pin.voteKey': pin });
            // console.log(topic)
            if (!topic) {
              console.log('Topic not found');
              return;
            }
            const result = topic.pin.find(obj => obj.voteKey == pin)
            console.log(result)
            if (result && result.voteWeight == 0) {
            //   console.log("here")
              reply.send({ success: false, error: "You already vote for this poll" });
              return
            }
          } catch {
            reply.send({ success: false, error: error.message });
            return
          }
        }
    
        const estimatedGas = await votingSystem.methods.voteForChoice(
          topicId, userEmail, choices, invitationType, voteTime
        ).estimateGas({ from: accounts[0] });
        const gasLimit = Math.floor(estimatedGas * 1.2); // Add 20% buffer
    
        const receipt = await votingSystem.methods.voteForChoice(
          topicId, userEmail, choices, invitationType, voteTime
        ).send({ from: accounts[0], gas: gasLimit });
    
        console.log('Vote transaction receipt:', receipt);
    
        if (receipt.status) {
          console.log("Voted successfully");
          if (invitationType === "pincode") {
            // Update MongoDB document
            try {
              // const topic = await TopicModel.findOne({ _id: _id, 'pin.voteKey': pin });
              // console.log(topic)
              // if (!topic) {
              //   console.log('Topic not found');
              //   return;
              // }
    
              const updateResult = await TopicModel.updateOne(
                {
                  _id: _id,
                  'pin._id': pinObjectId,
                  'pin.voteKey': pin
                },
                {
                  $set: {
                    'pin.$.voteWeight': 0,
                    'pin.$.votedBy': userEmail
                  }
                }
              );
    
              if (updateResult.modifiedCount === 0) {
                console.log('No updates made');
              } else {
                console.log('Update successful');
              }
              reply.send({ success: true, hash: receipt.transactionHash });
            } catch (error) {
              console.error("Error during update operation:", error.message);
              reply.send({ success: false, error: error.message });
            }
          } else {
            reply.send({ success: true, hash: receipt.transactionHash });
          }
        } else {
          console.error('Transaction failed', receipt);
          reply.send({ success: false, error: 'Transaction failed' });
        }
      } catch (e) {
        console.error('Error:', e.message);
        reply.send({ success: false, error: e.message });
      }
}
module.exports = { updatePollStatusBySchedule, updatePollStatusByManual, vote, joinPoll };