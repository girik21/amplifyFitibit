// Add user to DynamoDB if not exists
export async function addUserIfNotExists(userId: string, email: string) {
  try {
    const res = await fetch("https://xcfnwn06f9.execute-api.us-west-2.amazonaws.com/dev/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, email }),
    });
    const data = await res.json();
    console.log("✅ Lambda response:", data);
    return data;
  } catch (err) {
    console.error("❌ Error calling usersLambda:", err);
    return null;
  }
}

// Fetch Fitbit Authorization URL
export async function getFitbitAuthUrl() {
  try {
    const res = await fetch("https://zcwew9c7ll.execute-api.us-west-2.amazonaws.com/dev/auth/start", {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    const { authUrl, codeVerifier } = data; // <--- grab codeVerifier
    if (!authUrl || !codeVerifier) throw new Error("Invalid server response");

    localStorage.setItem("fitbit_code_verifier", codeVerifier); // <--- SAVE IT 🔥

    window.location.href = authUrl;
  } catch (error) {
    console.error("❌ Error fetching Fitbit auth URL:", error);
    return null;
  }
}


// Complete Fitbit Authorization
export async function completeFitbitAuth(code: string, state: string) {
  try {
    const codeVerifier = localStorage.getItem("fitbit_code_verifier"); // <--- LOAD IT 🔥

    const res = await fetch("https://zcwew9c7ll.execute-api.us-west-2.amazonaws.com/dev/auth/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, state, codeVerifier }), // <--- INCLUDE IT 🔥
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("❌ Error completing Fitbit auth:", error);
    return null;
  }
}

