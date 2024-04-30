const Web3 = require('web3');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Auth = require('./truffle/build/contracts/Auth.json');
const VotingSystem = require('./truffle/build/contracts/VotingSystem.json');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_URI));

let auth
let votingSystem
const loadBlockchainData = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const authData = Auth.networks[networkId];
      const votingData = VotingSystem.networks[networkId];
  
      if (authData && votingData) {
        auth = new web3.eth.Contract(Auth.abi, authData.address);
        votingSystem = new web3.eth.Contract(VotingSystem.abi, votingData.address);
        // console.log("Connected to Geth")
        return { Auth: auth, VotingSystem: votingSystem, accounts: accounts[0] };
      } else {
        console.error("Contracts not deployed to detected network.");
        return null;
      }
    } catch (error) {
      console.error("Error loading blockchain data:", error);
    }
  };

// Initialize nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter verification failed:', error);
  } else {
    console.log('Transporter is ready to send emails');
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

module.exports = { web3, transporter, loadBlockchainData, mongoose };
