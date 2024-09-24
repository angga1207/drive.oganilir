import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            type: "credentials",
            credentials: {},
            authorize(credentials, req) {
                const {
                    id,
                    username,
                    fullname,
                    firstname,
                    lastname,
                    photo,
                    email,
                    googleIntegated,
                    storage_total,
                    storage_used,
                    storage_rest,
                    storage_percent,
                    token,
                } = credentials as {
                    id: string
                    username: string,
                    fullname: string
                    firstname: string
                    lastname: string
                    photo: string
                    email: string
                    googleIntegated: string
                    storage_total: string
                    storage_used: string
                    storage_rest: string
                    storage_percent: string
                    token: string
                };

                if (token && id) {
                    return {
                        id: id as string,
                        username: username,
                    }
                }
                // throw new Error("No credentials");
                return null;
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],

    pages: {
        // signIn: "/login",
        // signOut: "/logout",
    },
};
export default NextAuth(authOptions);