const { mongoose } = require('../connection');

const subSchema = new mongoose.Schema({
    voteKey: String,
    voteWeight: Number,
    votedBy: String
  });
  
  const topicSchema = new mongoose.Schema({
    uuid: String,
    title: String,
    description: String,
    name: String,
    startDate: Date,
    endDate: Date,
    createdByMongo: String,
    pin: [subSchema]
  });
  
  const TopicModel = mongoose.model('Topic', topicSchema);
  module.exports = { TopicModel };