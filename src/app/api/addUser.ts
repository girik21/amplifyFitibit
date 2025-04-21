// app/api/addUser.ts
export async function addUserIfNotExists(userId: string, email: string) {
    try {
      const res = await fetch("https://xcfnwn06f9.execute-api.us-west-2.amazonaws.com/dev/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: userId, email })
      });
  
      const data = await res.json();
      console.log("✅ Lambda response:", data);
      return data;
    } catch (err) {
      console.error("❌ Error calling usersLambda:", err);
      return null;
    }
  }
  