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

const getUserInfo = async (id) => {
	const user = await User.findById(id)
		.populate("images")
		.populate({ path: "favorites", model: Tweet })
		.populate("followers")
		.populate("following");

	return user;
};

const getDmsPage = async (page, id) => {
	const user = await User.findById(id).populate("DMs");
	const count = user.DMs.length;
	const pageSize = 10;
	const lastPage = Math.ceil(count / pageSize);
	page = page > lastPage ? lastPage : page;
	page = page < 1 ? 1 : page;
	const offset = (page - 1) * pageSize;

	return {
		dms: user.DMs.slice(offset, offset + pageSize),
		page: page,
		totalPages: lastPage,
		pageSize: pageSize,
		count: count,
	};
	// return {shit: "shit"}
};

router.get("/", isLoggedInReject, (req, res) => {
	res.send("testing logged in functions");
});

router.post(
	"/register",
	catchAsync(async (req, res) => {
		console.log(req.body);
		const user = new User({
			email: req.body.email,
			username: req.body.username,
			phone: req.body.phone,
			birth_date: req.body.birth_date,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
		});
		const newUser = await User.register(user, req.body.password);
		res.send(newUser);
	})
);

router.post("/login", passport.authenticate("local"), (req, res) => {
	console.log(req.body);
	res.send("Logged in successfully!");
});

router.get(
	"/:id",
	isLoggedInAccept,
	catchAsync(async (req, res, next) => {
		if (req.logged === true && req.user._id.toString() === req.params.id) {
			const results = await getUserInfo(req.params.id);
			if (!results) {
				return next();
			}
			res.status(200).json(results);
		} else {
			const results = await getUserInfo(req.params.id);
			res.status(200).json({
				FirstName: results.firstName,
				LastName: results.lastName,
				birth_date: results.birth_date,
				images: results.images,
				favorites: results.favorites,
				following: results.following,
				followers: results.followers,
			});
		}
	})
);

router.patch(
	"/:id",
	isLoggedInReject,
	catchAsync(async (req, res, next) => {
		console.log(req.user.email);
		console.log(req.user.username);
		console.log(req.user.phone);
		const result = await User.findByIdAndUpdate(req.params.id, req.body);
		if (!result) {
			return next();
		}
		console.log(result);
		res.status(200).json(result);
	})
);

router.delete(
	"/:id",
	isLoggedInReject,
	catchAsync(async (req, res, next) => {})
);

router.get(
	"/:id/images",
	catchAsync(async (req, res, next) => {
		const user = await User.findById(req.params.id).populate("images");
		res.status(200).json(user.images);
	})
);

router.get(
	"/:id/dms",
	catchAsync(async (req, res, next) => {
		console.log(req.params.id);
		const dmsPage = await getDmsPage(
			parseInt(req.query.page) || 1,
			req.params.id
		);
		console.log(dmsPage);
		res.status(200).json(dmsPage);
	})
);

module.exports = router;
