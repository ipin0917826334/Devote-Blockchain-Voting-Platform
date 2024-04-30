const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { web3, loadBlockchainData } = require('../connection');
let auth
async function initialize() {
    const { Auth } = await loadBlockchainData();
    auth = Auth;
}
initialize();

async function loginUser(request, reply) {
    const { email, password } = request.body;
    if (!email || !password) {
        reply.send({ success: false, error: "Email and password are required" });
        return;
    }
    try {
        const userCount = await auth.methods.userCount().call();
        let userFound = false;
        let userData = null;

        for (let i = 0; i < userCount; i++) {
            userData = await auth.methods.getUserData(i).call();
            if (userData[0] === email) {
                userFound = true;
                break;
            }
        }
        // console.log(userData);
        if (!userFound) {
            reply.send({ success: false, error: "User not found" });
            return;
        }
        if (!userData[3]) {
            reply.send({ success: false, error: "Password hash not found" });
            return;
        }
        if (bcrypt.compareSync(password, userData[3])) {
            const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '1h' });
            reply.send({
                success: true,
                // user: {
                //   email: userData[0],
                //   firstName: userData[1],
                //   lastName: userData[2]
                // },
                token: token
            });
        } else {
            reply.send({ success: false, error: 'Invalid email or password' });
        }
    } catch (e) {
        console.error('Error:', e.message);
        reply.send({ success: false, error: e.message });
    }
}

async function registerUser(request, reply) {
    const { email, firstName, lastName, hashedPassword } = request.body;
    try {
        const accounts = await web3.eth.getAccounts();
        const estimatedGas = await auth.methods
            .createUser(email, firstName, lastName, hashedPassword)
            .estimateGas({ from: accounts[0] });
        await auth.methods
            .createUser(email, firstName, lastName, hashedPassword)
            .send({ from: accounts[0], gas: estimatedGas })
            .on('transactionHash', (hash) => {
                console.log(`Register Transaction hash: ${hash}`);
            });

        reply.send({ success: true });
    } catch (e) {
        console.error('Error:', e.message);
        reply.send({ success: false, error: e.message });
    }
}
async function checkEmail(request, reply) {
    try {
        const email = request.params.email;
        const existingUser = await auth.methods.usersList(email).call();
        const userEmail = existingUser.email;
        reply.send({ success: true, email: userEmail });
    } catch (e) {
        console.error('Error:', e.message);
        reply.send({ success: false, error: e.message });
    }
}
async function getUser(request, reply) {
    try {
        const { email } = request.user;
        const userCount = await auth.methods.userCount().call();
        let userData = null;
    
        for (let i = 0; i < userCount; i++) {
          const data = await auth.methods.getUserData(i).call();
          if (data[0] === email) {
            userData = {
              email: data[0],
              firstName: data[1],
              lastName: data[2]
            };
            break;
          }
        }
    
        if (!userData) {
          return reply.code(404).send({ success: false, error: 'User not found' });
        }
    
        reply.send({ success: true, user: userData });
      } catch (error) {
        console.error('Error:', error.message);
        reply.code(500).send({ success: false, error: 'Server error' });
      }
}
async function getUsers(request, reply) {
    try {
        const userCount = await auth.methods.userCount().call();
        const users = [];
        for (let i = 0; i < userCount; i++) {
          const userData = await auth.methods.getUserData(i).call();
          users.push({
            email: userData[0],
            firstName: userData[1],
            lastName: userData[2]
          });
        }
        reply.send({ success: true, users });
      } catch (e) {
        console.error('Error:', e.message);
        reply.send({ success: false, error: e.message });
      }
}

module.exports = { loginUser, registerUser, checkEmail, getUser, getUsers };