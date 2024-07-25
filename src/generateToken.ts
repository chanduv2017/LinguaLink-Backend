import jwt from "jsonwebtoken"

function generateToken(username: string) {
  return jwt.sign(
    { userId: username },
    process.env.BCRYPT_PASSWORD_STRING as string,
    { expiresIn: "1h" } // Token expires in 1 hour
  );
}

export default generateToken;
