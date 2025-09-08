// this serves to check if user has a token before fulfilling request while logged in

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
  try {
    // grab cookie in the user's browser
    const token = req.cookies.jwt;
    if (!token)
      return res
        .status(401)
        .json({ message: "Unauthorized request - No Token Provided" });
    // extract token info from cookie
    //contains userId since we passed it to generate token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded)
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });

    // store user info inside user minus password
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) return res.status(404).json({ message: "User not found." });

    // at this point user is authenticated -> add user to the request
    req.user = user;
    // this will allow for next function to be called -> router.put("/update-profile",  protectRoute, updateProfile); protectRoute is called then update Profile is called
    next();
  } catch (error) {
    console.log("Internal Error ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default protectRoute;
