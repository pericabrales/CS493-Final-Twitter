const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const DM = require("../models/dm");
const catchAsync = require("../utils/catchAsync");
const { isLoggedInReject, isLoggedInAccept } = require("../middleware");
const checkIfAlreadyMessaged = require("../models/dm");
const e = require("express");

router.get("/", (req, res) => {
  res.send("Messages");
});

//This creates a new dm/conversation between two users.  We should probably check to  make sure one doesn't already exist
router.post(
  "/",
  isLoggedInReject,
  catchAsync(async (req, res) => {
    const user1 = await User.findById({ _id: req.user._id });
    const user2 = await User.findById({ _id: req.body.userId });

   
      let messagesBetween = false
      const arr = user1.DMs;
      const arr2 = user2.DMs;

      arr.forEach((value) => {
        arr2.forEach((value2) => {
          if (JSON.stringify(value) === JSON.stringify(value2)) {
            messagesBetween = true
          }
        });
      });

      if(messagesBetween){
        return res.send("Already a DM between those two users")
      }

      else{

      
      const dm = new DM({
        userid1: req.user._id,
        userid2: req.body.userId,
        messages: [
          {
            senderid: req.user._id,
            message: req.body.message,
            date: req.body.date,
          },
        ],
      });
      console.log(dm);
      await User.updateOne({ _id: req.user._id }, { $push: { DMs: dm._id } });
      await User.updateOne(
        { _id: req.body.userId },
        { $push: { DMs: dm._id } }
      );
      dm.save();
      res.send("saved");
      }
  })
);

// This adds a message to an ongoing DM/conversation
router.post(
  "/:id",
  isLoggedInReject,
  catchAsync(async (req, res) => {
    const message = {
      userId: req.user._id,
      message: req.body.message,
      date: req.body.date,
    };
    const result = await DM.updateOne(
      { _id: req.params.id },
      { $push: { messages: message } }
    );
    console.log(result);

    res.status(200).json(result);
  })
);

// This retrieves a conversation
router.get(
  "/:id",
  isLoggedInReject,
  catchAsync(async (req, res) => {
    const dm = await DM.findOne({ _id: req.params.id });
    res.send(dm);
  })
);

// router.get(
//   "/private/:id",
//   catchAsync(async (req, res) => {
//     const user = await DM.findOne({ _id: req.params.id });
//     res.send(user);
//   })
// );

router.get(
  "/user/:username",
  catchAsync(async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    res.send(user);
  })
);

module.exports = router;
