const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const { isLoggedInReject, isLoggedInAccept } = require("../middleware");
const mongoose = require("mongoose");

async function getAllFollowers(id, page) {
	const user = await User.findById(id).populate("followers");

	console.log("user followers: ", user.followers);
	//need pagination (just the page thing)
	console.log("followers count", user.followers.length);
	const count = user.followers.length;
	const pageSize = 10;
	const lastPage = Math.ceil(count / pageSize);
	page = page > lastPage ? lastPage : page;
	page = page < 1 ? 1 : page;
	const offset = (page - 1) * pageSize;
    let followers = user.followers.map((item) => {
			return {
				firstName: item.firstName,
				lastName: item.lastName,
                userName: item.username
			};
		});

	return {
		followers: followers.slice(offset, offset + pageSize),
		page: page,
		totalPages: lastPage,
		pageSize: pageSize,
		count: count,
	};
}

async function getAllFollowing(id, page) {
	const user = await User.findById(id).populate("following");

	console.log("following: ", user.following);
	//need pagination (just the page thing)
	console.log("following count", user.following.length);
	const count = user.following.length;
	const pageSize = 10;
	const lastPage = Math.ceil(count / pageSize);
	page = page > lastPage ? lastPage : page;
	page = page < 1 ? 1 : page;
	const offset = (page - 1) * pageSize;
    let following = user.following.map((item) => {
			return {
				firstName: item.firstName,
				lastName: item.lastName,
				userName: item.username,
			};
		});

	return {
		following: following.slice(offset, offset + pageSize),
		page: page,
		totalPages: lastPage,
		pageSize: pageSize,
		count: count,
	};
}

// Follow another user.
router.patch("/:id", isLoggedInReject, catchAsync(async (req, res, next) => {
	const result = await User.findOne({ _id: req.params.id });
	if (!result) {
		return next();
	}
    console.log(req.user.id)
    console.log(req.user._id)
	const moreResults = await User.find({_id: req.user._id,
		following: mongoose.Types.ObjectId(req.params.id),
	});
	console.log(moreResults.length);
    console.log(moreResults)
	if (moreResults.length > 0) {
		return next();
	}
	const follow = await User.updateOne(
		{ _id: req.user._id },
		{ $push: { following: req.params.id } }
	);
	const follower = await User.updateOne(
		{ _id: req.params.id },
		{ $push: { followers: req.user._id } }
	);
	res.status(200).json({ follow: follow, follower: follower });
}));

// Stop following another user
router.delete("/:id", isLoggedInReject, catchAsync(async (req, res, next) => {
	const result = await User.findOne({ _id: req.params.id });
	console.log(req.params.id);
	console.log(req.user.id);
	if (!result) {
		return next();
	}
	const moreResults = await User.find({_id: req.user._id,
		following: mongoose.Types.ObjectId(req.params.id),
	});

	console.log(moreResults);
	if (moreResults.length <= 0) {
		return next();
	}
	const follow = await User.updateOne(
		{ _id: req.user._id },
		{ $pull: { following: req.params.id } }
	);
	const follower = await User.updateOne(
		{ _id: req.params.id },
		{ $pull: { followers: req.user._id } }
	);
	res.status(200).json({ follow: follow, follower: follower });
}));

// Get all followers of user
router.get("/:id", isLoggedInAccept, catchAsync(async (req, res, next) => {
	const followers = await getAllFollowers(req.params.id, req.query.page || 1);

	if (followers.page < followers.totalPages) {
		followers.links.nextPage = `/followers/${req.params.id}?page=${followers.page + 1}`;
		followers.links.lastPage = `/followers/${req.params.id}?page=${followers.totalPages}`;
	}
	if (followers.page > 1) {
		followers.links.prevPage = `/followers/${req.params.id}?page=${
			followers.page - 1
		}`;
		followers.links.firstpage = `/followers/${req.params.id}?page=1`;
	}

    res.status(200).send(followers);
}));

// get every user that a user is following
router.get("/:id/following", isLoggedInAccept, catchAsync(async (req, res, next) => {
    const following = await getAllFollowing(
			req.params.id,
			req.query.page || 1
		);
	if (following.page < following.totalPages) {
		following.links.nextPage = `/followers//${req.params.id}/following?page=${
			following.page + 1
		}`;
		following.links.lastPage = `/followers/${req.params.id}/following?page=${following.totalPages}`;
	}
	if (following.page > 1) {
		following.links.prevPage = `/followers/${req.params.id}/following?page=${
			following.page - 1
		}`;
		following.links.firstpage = `/followers//${req.params.id}/following?page=1`;
	}

    res.status(200).send(following);
}));

module.exports = router;
