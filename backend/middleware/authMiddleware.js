const jwt = require('jsonwebtoken');

async function verifyToken(request, reply) {
    const token = request.headers['authorization'];
    if (!token) {
      reply.code(401).send({ success: false, error: 'Token is required' });
      throw new Error('Unauthorized');
    }
  
    try {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
      request.user = decoded;
    } catch (error) {
      reply.code(401).send({ success: false, error: 'Invalid token' });
      throw new Error('Unauthorized');
    }
  }
  module.exports = { verifyToken };