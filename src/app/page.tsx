"use client";

import { useEffect } from "react";
import { Amplify } from "aws-amplify";
import { getCurrentUser } from "aws-amplify/auth";
import { withAuthenticator } from "@aws-amplify/ui-react";
import type { WithAuthenticatorProps } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import config from "../amplifyconfiguration.json";

import { addUserIfNotExists, getFitbitAuthUrl, completeFitbitAuth } from "./api/addUser";
import { useRouter } from "next/navigation";

Amplify.configure(config);

export function Home({ signOut, user }: WithAuthenticatorProps) {
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndHandleOAuth = async () => {
      try {
        const { userId, signInDetails } = await getCurrentUser();
        const email = signInDetails?.loginId;

        console.log("SUB:", userId);
        console.log("Email:", email);

        if (userId && email) {
          await addUserIfNotExists(userId, email);
        }

        // --- Handle Fitbit OAuth2 callback ---
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = urlParams.get("state");

        if (code && state) {
          console.log("🔵 Fitbit OAuth2 code detected:", code);
          console.log("🔵 Fitbit OAuth2 state detected:", state);

          const tokenData = await completeFitbitAuth(code, state);

          if (tokenData) {
            console.log("🟢 Fitbit Tokens:", tokenData);

            localStorage.setItem("fitbitAccessToken", tokenData.access_token);
            localStorage.setItem("fitbitRefreshToken", tokenData.refresh_token);
            localStorage.setItem("fitbitUserId", tokenData.fitbit_user_id);

            router.replace("/", undefined); // Clean URL after success
          }
        }
      } catch (error) {
        console.error("❌ Error during OAuth2 process:", error);
      }
    };

    fetchUserAndHandleOAuth();
  }, []);

  const handleFitbitLogin = async () => {
    await getFitbitAuthUrl(); // This will redirect to Fitbit login
  };

  return (
    <>
      <div className="mx-auto justify-center mt-10 flex flex-row gap-4">
        <h1>Hello {user?.username}</h1>
        <button
          onClick={signOut}
          className="px-5 py-2 bg-gray-200 rounded-2xl hover:bg-gray-100 cursor-pointer text-black"
        >
          Sign out
        </button>
      </div>

      <div className="mx-auto justify-center items-center mt-8">
        <button
          onClick={handleFitbitLogin}
          className="px-5 py-2 bg-gray-600 rounded-2xl hover:bg-gray-100 cursor-pointer text-black"
        >
          Sign in with Fitbit
        </button>
      </div>
    </>
  );
}

export default withAuthenticator(Home);
