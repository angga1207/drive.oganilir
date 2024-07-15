import { NextAuthOptions, User, getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";
import { BaseUri } from '@/pages/api/serverIP';

export const authConfig: NextAuthOptions = {
    providers: [
        // CredentialsProvider({
        //     name: 'Credentials',
        //     credentials: {
        //         username: { label: "Username", type: "text" },
        //         password: { label: "Password", type: "password" }
        //     },
        //     async authorize(data: any) {
        //         const res = await fetch(`${BaseUri()}/login`, {
        //             method: 'POST',
        //             body: JSON.stringify(data),
        //             headers: { "Content-Type": "application/json" }
        //         })
        //         const user = await res.json()
        //         if (res.ok && user) {
        //             return user;
        //         }
        //         return null;
        //     }
        // }),
        // GoogleProvider({
        //     clientId: process.env.GOOGLE_CLIENT_ID as string,
        //     clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        //     authorization: {
        //         params: {
        //             prompt: "consent",
        //             access_type: "offline",
        //             response_type: "code"
        //         }
        //     }
        // }),
    ],
};