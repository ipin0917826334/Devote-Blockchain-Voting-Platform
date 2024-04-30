const Auth = artifacts.require("Auth");
const VotingSystem = artifacts.require("VotingSystem");

module.exports = function (deployer) {
  deployer.deploy(Auth);
  deployer.deploy(VotingSystem);
};
