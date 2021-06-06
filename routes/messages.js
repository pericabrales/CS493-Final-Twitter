const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const DM = require("../models/dm");
const catchAsync = require("../utils/catchAsync");

router.get("/", (req, res) => {
  res.send("Messages");
});

router.post(
  "/",
  catchAsync(async (req, res) => {
    const user1 = await User.findOne({ _id: req.body.userId1 });
    const user2 = await User.findOne({ _id: req.body.userId2 });

    const dm = new DM({
      userid1: user1._id,
      userid2: user2._id,
      messages: [
        {
          senderid: user1._id,
          message: req.body.message,
          date: req.body.date,
        },
      ],
    });
    await User.updateOne({ _id: req.body.userId1 }, { $push: { DMs: dm } });
    await User.updateOne({ _id: req.body.userId2 }, { $push: { DMs: dm } });
    dm.save();
    res.send("saved");
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const user = await User.findOne({ _id: req.params.id });
    res.send(user);
  })
);

router.get(
  "/private/:id",
  catchAsync(async (req, res) => {
    const user = await DM.findOne({ _id: req.params.id });
    res.send(user);
  })
);

module.exports = router;