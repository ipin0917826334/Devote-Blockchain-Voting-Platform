// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    struct Choice {
        string choice;
        uint256 score;
        string[] voters;
    }
    struct EmailList {
        string email;
        string firstName;
        string lastName;
        uint256 voteWeight;
        string voteKey;
        string voteTime;
    }
    struct Pin {
        string voteKey;
        uint256 voteWeight;
        string votedBy;
    }
    struct NewTitle {
        string id;
        string image;
        string durationType;
        string createdBy;
        string link;
        string ballotType;
        string invitationType;
        Choice[] choices; // changed to Choice array
        EmailList[] emailList;
        string pollStatus;
        string mongoId;
    }

    struct VoteTopic {
        NewTitle newtitle;
    }

    mapping(string => VoteTopic) public topics;
    string[] public topicIds;
    mapping(string => string[]) private topicsByCreator;

    function addTopic(string memory _uuid, NewTitle memory _newtitle) public {
        topics[_uuid].newtitle.id = _newtitle.id;
        topics[_uuid].newtitle.image = _newtitle.image;
        topics[_uuid].newtitle.durationType = _newtitle.durationType;
        topics[_uuid].newtitle.createdBy = _newtitle.createdBy;
        topics[_uuid].newtitle.link = _newtitle.link;
        topics[_uuid].newtitle.ballotType = _newtitle.ballotType;
        topics[_uuid].newtitle.invitationType = _newtitle.invitationType;
        topics[_uuid].newtitle.pollStatus = _newtitle.pollStatus;
        topics[_uuid].newtitle.mongoId = _newtitle.mongoId;

        // For dynamic struct array choices
        for (uint i = 0; i < _newtitle.choices.length; i++) {
            Choice memory currentChoice = _newtitle.choices[i];
            topics[_uuid].newtitle.choices.push(
                Choice({
                    choice: currentChoice.choice,
                    score: currentChoice.score,
                    voters: currentChoice.voters
                })
            );
        }
        for (uint i = 0; i < _newtitle.emailList.length; i++) {
            EmailList memory currentEmailList = _newtitle.emailList[i];
            topics[_uuid].newtitle.emailList.push(
                EmailList({
                    email: currentEmailList.email,
                    firstName: currentEmailList.firstName,
                    lastName: currentEmailList.lastName,
                    voteWeight: currentEmailList.voteWeight,
                    voteKey: currentEmailList.voteKey,
                    voteTime: currentEmailList.voteTime
                })
            );
        }

        topicIds.push(_uuid);
        // Register the topic under the creator email
        topicsByCreator[_newtitle.createdBy].push(_uuid);
    }

    function addUserToPoll(
        string memory _pollId,
        EmailList memory _newUser
    ) public {
        // Ensure that the poll exists
        require(
            bytes(topics[_pollId].newtitle.id).length > 0,
            "Poll does not exist"
        );

        // Add the new user to the poll email list
        topics[_pollId].newtitle.emailList.push(_newUser);
    }

    function updateStatus(
        string memory _uuid,
        string memory _pollStatus
    ) public {
        topics[_uuid].newtitle.pollStatus = _pollStatus;
    }

    function bytes32ToString(
        bytes32 _bytes32
    ) public pure returns (string memory) {
        uint8 i = 0;
        while (i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

    mapping(string => mapping(address => bool)) public hasVoted;
    mapping(string => mapping(string => bool)) public hasPinVoted;
    event Voted(
        string uuid,
        string email,
        string choice,
        string pin,
        string invitationType,
        string voteTime
    );

    function voteForChoice(
        string memory _uuid,
        string memory _email,
        string[] memory _choices,
        string memory _invitationType,
        string memory _voteTime
    ) public {
        require(
            keccak256(bytes(topics[_uuid].newtitle.pollStatus)) ==
                keccak256(bytes("Open")),
            "Voting is not allowed for this poll as it is not open"
        );
        bool isEmailFound = false;
        for (uint i = 0; i < topics[_uuid].newtitle.emailList.length; i++) {
            if (
                keccak256(
                    abi.encodePacked(topics[_uuid].newtitle.emailList[i].email)
                ) == keccak256(abi.encodePacked(_email))
            ) {
                if (topics[_uuid].newtitle.emailList[i].voteWeight == 1) {
                    isEmailFound = true;
                    topics[_uuid].newtitle.emailList[i].voteWeight -= 1;
                    topics[_uuid].newtitle.emailList[i].voteTime = _voteTime;
                }
                break;
            }
        }

        for (uint i = 0; i < topics[_uuid].newtitle.choices.length; i++) {
            for (uint v = 0; v < _choices.length; v++) {
                if (
                    keccak256(
                        abi.encodePacked(
                            topics[_uuid].newtitle.choices[i].choice
                        )
                    ) == keccak256(abi.encodePacked(_choices[v]))
                ) {
                    if (
                        keccak256(abi.encodePacked(_invitationType)) ==
                        keccak256(abi.encodePacked("email")) &&
                        isEmailFound
                    ) {
                        topics[_uuid].newtitle.choices[i].score += 1;
                        topics[_uuid].newtitle.choices[i].voters.push(_email);
                    } else if (
                        keccak256(abi.encodePacked(_invitationType)) ==
                        keccak256(abi.encodePacked("pincode"))
                        // isKeyFound
                    ) {
                        topics[_uuid].newtitle.choices[i].score += 1;
                        topics[_uuid].newtitle.choices[i].voters.push(_email);
                    }

                    break;
                }
            }
        }

    }

    function getTopic(
        string memory _uuid
    ) public view returns (VoteTopic memory) {
        return topics[_uuid];
    }

    function getTotalTopics() public view returns (uint) {
        return topicIds.length;
    }
     function getTopicsByEmail(string memory creatorEmail) public view returns (string[] memory) {
        return topicsByCreator[creatorEmail];
    }
}
