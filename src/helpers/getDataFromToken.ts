
import { NextRequest } from "next/server";
import { jwtVerify, JWTPayload } from 'jose';

interface UserJwtPayload extends JWTPayload {
    userId: string;
}

export const getDataFromToken = async (request: NextRequest): Promise<string | null> => {
    try {
        const token = request.cookies.get("auth_token")?.value || "";
        if (!token) {
            return null; // Return null if no token
        }

        if (!process.env.TOKEN_SECRET) {
            throw new Error('TOKEN_SECRET is not set in the environment.');
        }

        const secret = new TextEncoder().encode(process.env.TOKEN_SECRET);
        const { payload } = await jwtVerify<UserJwtPayload>(token, secret);
        
        return payload.userId;

    } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Token verification failed:", error.message);
        } else {
          console.error("An unknown error occurred during token verification");
        }
        return null; // Return null on verification failure
    }
}
