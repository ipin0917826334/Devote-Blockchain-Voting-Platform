// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Auth {
    uint public userCount = 0;

    mapping(string => user) public usersList;
    string[] public userEmails; // Keep track of user emails for indexing

    struct user {
        string email;
        string firstName;
        string lastName;
        string password;
    }

    // events

    event userCreated(
        string email,
        string firstName,
        string lastName,
        string password
    );

    function createUser(
        string memory _email,
        string memory _firstName,
        string memory _lastName,
        string memory _password
    ) public emailNotUsed(_email) {
        userCount++;

        usersList[_email] = user(_email, _firstName, _lastName, _password);
        userEmails.push(_email);
        emit userCreated(_email, _firstName, _lastName, _password);
    }

    modifier emailNotUsed(string memory _email) {
        require(
            bytes(usersList[_email].email).length == 0,
            "Email already used"
        );
        _;
    }
    function getUserData(uint index) public view returns (string memory, string memory, string memory, string memory) {
        require(index < userCount, "Invalid index");
        string memory email = userEmails[index];
        user memory userData = usersList[email];
        return (email, userData.firstName, userData.lastName, userData.password);
    }
}
