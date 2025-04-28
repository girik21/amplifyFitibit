const crypto = require('crypto');
const axios = require('axios');
const { withCors } = require('../utils/withCors.js');

const CLIENT_ID = "23QDT2";
const REDIRECT_URI = "http://localhost:3000";
const CLIENT_SECRET = "823d0768afd84bd74790dbd2b51d60d3"

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };
}

function base64urlEncode(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// --- Start Fitbit Authorization ---
const startFitbitAuth = async (event) => {
  console.log("🔵 [Callign the start fitbit  auth]");

  const state = crypto.randomBytes(32).toString('hex');
  const codeVerifier = crypto.randomBytes(64).toString('hex');
  const codeChallenge = base64urlEncode(crypto.createHash('sha256').update(codeVerifier).digest());

  console.log("🔵 [startFitbitAuth] Generated State:", state);
  console.log("🔵 [startFitbitAuth] Generated Code Verifier:", codeVerifier);

  const scope = "profile activity sleep weight";

  const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}`;

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ authUrl, codeVerifier }),
  };
};

// --- Complete Fitbit Authorization ---
const completeFitbitAuth = async (event) => {
  console.log("🔵 [Callign the complete fitbit  auth]");

  const { code, state, codeVerifier } = JSON.parse(event.body);

  console.log("🟠 [completeFitbitAuth] Received State:", state);
  console.log("🟠 [completeFitbitAuth] Received Code:", code);

  if (!code || !state) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: "Missing code or state" }),
    };
  }

  console.log("code verifier", codeVerifier)
  
  if (!codeVerifier) {
    console.error("❌ [completeFitbitAuth] Invalid or expired state:", state);
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: "Invalid or expired state" }),
    };
  }

  console.log("🟢 [completeFitbitAuth] Found Code Verifier for State:", state);

  try {
    const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    const response = await axios.post('https://api.fitbit.com/oauth2/token',
      new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        code_verifier: codeVerifier,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basicAuth}`, // 👈 ADD THIS HEADER!
        }
      }
    );

    console.log("✅ Fitbit token response:", response.data);

    const { access_token, refresh_token, user_id } = response.data;


    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        access_token,
        refresh_token,
        fitbit_user_id: user_id,
      }),
    };
  } catch (error) {
    console.error('❌ Fitbit token exchange failed:', error.response?.data || error.message);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: "OAuth2 token exchange failed",
        detail: error.response?.data || error.message,
      }),
    };
  }
};

exports.startFitbitAuth = withCors(startFitbitAuth);
exports.completeFitbitAuth = withCors(completeFitbitAuth);
