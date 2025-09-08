import User from "../models/user.model.js";
import bcrypt from "bcryptjs"; // hashing
import generateToken from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }
    // retrieve any user with provided email
    const user = await User.findOne({ email });
    // if it exists return an error message otherwise move on
    if (user) return res.status(400).json({ message: "Email already exists." });

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // sending JSON to User(); with precised fields --> password content differs from actual req content after hashing

    const newUser = new User({
      fullName: fullName,
      email: email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here and provide to user through res
      generateToken(newUser._id, res);
      // add new User to the db
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // check if email has been registered with an account before
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    // if email exists then check password

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials." });

    // if correct -> generate token
    const token = generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller ", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    // this time send a new cookie as response but set max life to 0 so basically overwriting initial cookie -> cant log in
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    // id is available thanks to the token decoding -> user has been added to the request -> req.user = user; inside middleware
    const userId = req.user._id;

    if (!profilePic)
      return res.status(400).json({ message: "Profile pic is required" });

    // upload picture to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(profilePic); // contains url to the picture

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ); // add url to profilePic field and return updated object
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile controller ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// simply to check if we have a valid authentication -> for refresh purposes
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
