const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary");

const User = require("../models/user");
const Tweet = require("../models/tweet");
const catchAsync = require("../utils/catchAsync");

const { isLoggedInReject, isLoggedInAccept } = require("../middleware");


router.get("/", (req, res) => {
	res.send("Tweets");
});

router.post("/", isLoggedInReject, catchAsync(async(req, res, next) => {
  const tweet = new Tweet({
    userid: req.user._id,
    message: req.body.message
  })
  await tweet.save();
  await User.updateOne({ _id: req.user._id }, { $push: { tweets: tweet._id } });
  res.status(200).json(tweet);
}))

router.get("/:id", isLoggedInAccept,  catchAsync(async(req, res, next) =>{
  const tweet = await Tweet.findOne({_id: req.params.id});
  res.status(200).json(tweet);
}))

module.exports = router;
