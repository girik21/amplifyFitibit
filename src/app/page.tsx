"use client";

import { useEffect } from "react";
import { Amplify } from "aws-amplify";
import { getCurrentUser } from "aws-amplify/auth";
import type { WithAuthenticatorProps } from "@aws-amplify/ui-react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import config from "../amplifyconfiguration.json";
import { addUserIfNotExists } from "./api/addUser";

Amplify.configure(config);

export function Home({ signOut, user }: WithAuthenticatorProps) {
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { userId, signInDetails } = await getCurrentUser();
        const email = signInDetails?.loginId;

        console.log("SUB:", userId);
        console.log("Email:", email);

        if (userId && email) {
          addUserIfNotExists(userId, email);
        }
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <h1>Hello {user?.username}</h1>
      <button onClick={signOut}>Sign out</button>
    </>
  );
}

export default withAuthenticator(Home);
