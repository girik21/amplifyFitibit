const allowedOrigin = "http://localhost:3000";

exports.withCors = (handler) => {
  return async (event, context) => {
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type", // not "*"
          "Access-Control-Allow-Credentials": "true",
        },
        body: "",
      };
    }

    const response = await handler(event, context);

    return {
      ...response,
      headers: {
        ...(response.headers || {}),
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type", // not "*"
        "Access-Control-Allow-Credentials": "true",
      },
    };
  };
};
