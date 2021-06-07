const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const User = require("../models/user");
const Tweet = require("../models/tweet");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const { isLoggedInReject, isLoggedInAccept } = require("../middleware");


// get the array of the user's tweets by the user's id
async function getAllTweets(id, page) {
	const user = await User.findById(id).populate("tweets");
  const count = user.tweetsCount;
  const pageSize = 10;
  const lastPage = Math.ceil(count / pageSize);
  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;
  const offset = (page - 1) * pageSize;

  return {
  	tweets: user.tweets.slice(offset, offset+pageSize),
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  };
}

// return a list of tweets by user's id
router.get("/", isLoggedInReject, catchAsync(async(req, res) => {
	console.log("You're going to get the tweets by user's id");
	console.log("User id is ", req.user.id);
  // user's tweets with pagination
  const tweet = await getAllTweets(req.user.id, (req.query.page || 1));
	// pagination for the user's tweets
	tweet.links = {};
	if(tweet.page < tweet.totalPages){
		tweet.links.nextPage = `/tweets?page=${tweet.page+1}`;
		tweet.links.lastPage = `/tweets?page=${tweet.totalPages}`;
	}
	if(tweet.page > 1){
		tweet.links.prevPage = `/tweets?page=${tweet.page-1}`;
		tweet.links.firstpage = `/tweets?page=1`;
	}
	res.status(200).send(tweet);
}));


// return a tweet by its id
/* router.get("/:tweetid", isLoggedInReject, catchAsync(async(req, res) => {
	console.log("You're going to get the tweets by tweet's id");
	console.log("Tweet's id is ", req.params.tweetid);

  const findTweet = await User.findById(req.user.id).findOne({"tweets._id": req.params.tweetid}, {"tweets.$": 1});
	console.log("Expected: ", User.tweets.findOne({_id: ObjectId('60bde4cc6c99d96e5ce6d3c4')}));
	if(findTweet) {
    res.status(400).send({
    	error: "No tweet was found with such id."
    });
  }
  else {
		console.log(findTweet);
		res.status(200).json(findTweet);
  }
}));
*/

// create a tweet
router.post('/', isLoggedInReject, catchAsync(async(req, res) => {
  console.log("Nice tweet");
	const tweet = new Tweet({
		userid: req.user._id,
		message: req.body.message
	})
	if(tweet) {
		// update user's tweets number
		await User.findByIdAndUpdate(req.user.id, {
			$push: { tweets: tweet._id },
			$inc: { tweetsCount: 1 },
		});
		tweet.save();
	  res.status(200).json(tweet);
	}
	else {
		res.status(400).send({
			error: "No tweet for you"
		});
	}
}));


module.exports = router;
