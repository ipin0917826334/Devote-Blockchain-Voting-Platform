const Fastify = require('fastify');
const fastifyCors = require('@fastify/cors');
const fastifyStatic = require('@fastify/static');
const multer = require('fastify-multer')
const feedbackController = require('./controller/feedbackController');
const authController = require('./controller/authController');
const topicController = require('./controller/topicController');
const { updatePollStatusBySchedule } = require('./controller/voteController');
const voteController = require('./controller/voteController');
const { verifyToken } = require('./middleware/authMiddleware');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });
require('dotenv').config();


updatePollStatusBySchedule();
const app = Fastify();
app.register(fastifyCors);
app.register(multer.contentParser)
app.register(fastifyStatic, {
  root: path.join(__dirname, 'uploads'),
  prefix: '/uploads/',
});

app.post('/api/feedback', feedbackController.submitFeedback);
app.post('/api/pollstatus', { preHandler: [verifyToken] }, voteController.updatePollStatusByManual);
app.post('/api/login', authController.loginUser);
app.get('/api/topics', { preHandler: [verifyToken] }, topicController.getTopicByEmail);
app.get('/api/users/:linkId', { preHandler: [verifyToken] }, topicController.getUserByTopicId);
app.post('/api/update-poll-email-list', { preHandler: [verifyToken] }, topicController.addNewUserToPoll);
app.post('/api/update-poll-pins', { preHandler: [verifyToken] }, topicController.addNewPinToPoll)
app.get('/api/topic/:linkId', { preHandler: [verifyToken] }, topicController.getTopicByTopicId);
app.get('/api/topics/email/:email', { preHandler: [verifyToken] }, topicController.getTopicByEmailThatVoted)
app.get('/api/check-email/:email', authController.checkEmail);
app.post('/api/join-poll', { preHandler: [verifyToken] }, voteController.joinPoll);
app.post('/api/vote', { preHandler: [verifyToken] }, voteController.vote);
app.post('/api/add-topic', { preHandler: [verifyToken, upload.single("file")] }, topicController.addTopic);
app.post('/api/register', authController.registerUser);
app.post('/api/update-topic/:id', { preHandler: [verifyToken] }, topicController.updateTopicByTopicId);
app.get('/api/users', { preHandler: [verifyToken] }, authController.getUsers);
app.get('/api/user', { preHandler: [verifyToken] }, authController.getUser);

const start = async () => {
  try {
    await app.listen(3001, '0.0.0.0');
    console.log('Server is running on port 3001');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();    