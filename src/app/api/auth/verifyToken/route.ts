
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export const verifyToken = async (req: NextRequest) => {
  const token = req.cookies.get("auth_token")?.value || "";
  const secret = process.env.TOKEN_SECRET || "Shashi";

  if (!secret) {
    console.error("TOKEN_SECRET is not set in the environment.");
    return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
  }

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return NextResponse.json({message:"CGG", data: { decoded: payload, token } }, { status: 200 });
  } catch (error) {
    console.error("Token verification failed:", error);
    return NextResponse.json({ message: "Invalid token" }, { status: 400 });
  }
};

export async function GET(req: NextRequest) {
    return verifyToken(req);
}
