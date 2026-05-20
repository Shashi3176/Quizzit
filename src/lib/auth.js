const { jwtVerify } = require('jose').jwtVerify;
const { TextEncoder } = require('util');

async function verifyAuthToken(token) {
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
      decoded: payload, 
      token 
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

module.exports = { verifyAuthToken };
