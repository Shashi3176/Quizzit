import { jwtVerify } from "jose";

interface TokenPayload {
  userId: number;
  email: string;
  // Add other fields as needed
}

interface VerificationResult {
  decoded: TokenPayload;
  token: string;
}

export async function verifyAuthToken(token: string): Promise<VerificationResult | null> {
  const secret = process.env.TOKEN_SECRET || "Shashi";

  if (!secret) {
    console.error("TOKEN_SECRET is not set in the environment.");
    return null;
  }

  if (!token) {
    return null;
  }

  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return { 
      decoded: payload as unknown as TokenPayload, 
      token 
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
