const { mongoose } = require('../connection');

const feedbackSchema = new mongoose.Schema({
    name: String,
    score: Number,
    feedback: String
  });
  const Feedback = mongoose.model('Feedback', feedbackSchema);
  module.exports = {
    Feedback
  };