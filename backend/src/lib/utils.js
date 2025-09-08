// for cleanliness of code instead of implementing that inside the controller, I do it here
import dotenv from "dotenv";
import jwt from "jsonwebtoken"; // for generating cookie / token
const generateToken = (userId, res) => {
  // building token with jwt libray

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  // send a cookie as response to the user
  // http only cookie
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};

export default generateToken;
