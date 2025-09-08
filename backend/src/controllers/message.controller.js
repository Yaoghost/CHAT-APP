import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getUsersForSideBar = async (req, res) => {
  try {
    // this route is protected so we can grab the id from the user from the request
    const loggedInUserId = req.user._id;
    // query to filter all users in db except current user and return everything except passwords as well
    const filteredUsers = await User.findById({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSideBar controller ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    // deconstruct and rename to userToChatId
    const { id: userToChatId } = req.params;
    // this is a protected route
    const myId = req.user._id;
    //filter all messages with these attributes
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;

    if (image) {
      // upload image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId: senderId,
      receiverId: receiverId,
      text: text,
      image: imageUrl,
    });

    await newMessage.save();

    //  todo: realtime functionality goes here => socket.io
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
