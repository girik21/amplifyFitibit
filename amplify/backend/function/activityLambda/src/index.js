const { startFitbitAuth, completeFitbitAuth, testDBConnection } = require('./handlers/authHandler.js');
const { addUser } = require('./handlers/userHandler.js');

exports.handler = async (event) => {
  if (event.path === '/auth/start') {
    return startFitbitAuth(event);
  }

  if (event.path === '/auth/complete') {
    return completeFitbitAuth(event);
  }

  if (event.path === '/user') {
    return addUser(event);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'Not found' }),
  };
};
