const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log("Incoming event:", JSON.stringify(event));

  const defaultHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*"
  };

  if (event.httpMethod === 'OPTIONS') {
    // Handle CORS preflight
    return {
      statusCode: 200,
      headers: {
        ...defaultHeaders,
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ''
    };
  }

  if (event.httpMethod === 'POST' && event.body) {
    try {
      const body = JSON.parse(event.body);

      if (!body.id || !body.email) {
        return {
          statusCode: 400,
          headers: defaultHeaders,
          body: JSON.stringify({ error: "Missing 'id' or 'email'." }),
        };
      }

      const TableName = process.env.STORAGE_USERSTABLE_NAME;
      const existing = await ddb.get({ TableName, Key: { id: body.id } }).promise();

      if (existing.Item) {
        return {
          statusCode: 200,
          headers: defaultHeaders,
          body: JSON.stringify({ message: "User already exists", user: existing.Item }),
        };
      }

      const newUser = {
        id: body.id,
        email: body.email,
        createdAt: new Date().toISOString()
      };

      await ddb.put({ TableName, Item: newUser }).promise();

      return {
        statusCode: 200,
        headers: defaultHeaders,
        body: JSON.stringify({ message: "User added", user: newUser }),
      };
    } catch (err) {
      console.error("Lambda error:", err);
      return {
        statusCode: 500,
        headers: defaultHeaders,
        body: JSON.stringify({ error: "Internal error", detail: err.message }),
      };
    }
  }

  return {
    statusCode: 400,
    headers: defaultHeaders,
    body: JSON.stringify({ error: "Unsupported method or event type" }),
  };
};
