const { Feedback } = require('../model/feedback');
async function submitFeedback(request, reply) {
    try {
        const feedback = new Feedback(request.body);
        await feedback.save();
        reply.code(200).send('Feedback submitted');
      } catch (error) {
        reply.code(500).send(error.message || 'Internal Server Error');
      }
}
module.exports = { submitFeedback };