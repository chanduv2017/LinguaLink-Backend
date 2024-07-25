import jwt, { JwtPayload } from "jsonwebtoken";

import { Request, Response, NextFunction } from "express";

interface CustomRequest extends Request {
  userId?: string;
}

interface DecodedToken extends JwtPayload {
  userId?: string;
}

function verifyToken(req: CustomRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(403).json({ ok: false, message: "Token is required" });
  }

  jwt.verify(
    token,
    process.env.BCRYPT_PASSWORD_STRING as string,
    (err, decoded) => {
      if (err) {
        return res.status(401).json({ ok: false, message: "Invalid token" });
      }

      const decodedToken = decoded as DecodedToken;

      if (decodedToken.userId) {
        req.userId = decodedToken.userId;
        next();
      } else {
        return res
          .status(401)
          .json({ ok: false, message: "Invalid token payload" });
      }
    }
  );
  next();
}

export default verifyToken;
