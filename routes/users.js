const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const passport = require('passport')
const { isLoggedIn } = require("../middleware");


router.get("/", isLoggedIn, (req, res) => {
	res.send("Users");
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

router.post('/login',passport.authenticate('local'), (req, res) => {
  console.log(req.body)
  res.send('Logged in successfully!');
})



router.post("/image", upload.array("image"), (req, res) => {
	console.log(req.body, req.files);
	res.send("THINGS ARE A-OKAY!");
});

module.exports = router;
