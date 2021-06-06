const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const { isLoggedInReject, isLoggedInAccept } = require("../middleware");

router.get("/", isLoggedInReject, (req, res) => {
	res.send("testing logged in functions");
});

router.post(
	"/register",
	catchAsync(async (req, res) => {
		const user = new User({
			email: req.body.email,
			username: req.body.username,
			phone: req.body.phone,
			birth_date: req.body.birth_date,
		});
		console.log(req.body.username);
		console.log(req.body.password);
		console.log(typeof req.body.username);
		const newUser = await User.register(user, req.body.password);
		res.send(newUser);
	})
);

router.post("/login", passport.authenticate("local"), (req, res) => {
	console.log(req.body);
	console.log(req.user.id)
	res.send("Logged in successfully!");
});

router.get("/:id", async (req, res, next) => {
	const results = await User.findById(req.params.id)
		.populate("images")
		.populate("favorites")
		.populate("followers")
		.populate("following");
	if (!results) {
		return next();
	}
	res.status(200).json(results);
});

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
	catchAsync(async (req, res, next) => {})
);

module.exports = router;
