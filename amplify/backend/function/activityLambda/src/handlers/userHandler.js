const { getClient } = require('../db/connect.js');

exports.addUser = async (event) => {
  const { cognito_id, email, fitbit_user_id } = JSON.parse(event.body);

  if (!cognito_id || !email || !fitbit_user_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields: cognito_id, email, fitbit_user_id" }),
    };
  }

  const client = getClient();

  try {
    await client.connect();

    const insertQuery = `
      INSERT INTO users (cognito_id, email, fitbit_user_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (cognito_id) DO UPDATE
      SET email = EXCLUDED.email,
          fitbit_user_id = EXCLUDED.fitbit_user_id;
    `;

    await client.query(insertQuery, [cognito_id, email, fitbit_user_id]);
    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "✅ Fitbit user added/updated successfully!" }),
    };
  } catch (error) {
    console.error('❌ Error inserting/updating user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
