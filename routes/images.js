const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const { isLoggedInReject, isLoggedInAccept } = require("../middleware");


const { cloudinary } = require("../cloudinary");

// Get an image
router.get("/:id", catchAsync(async (req, res, next) => {
	let image = await User.findOne(
		{ "images._id": req.params.id },
		{ "images.$": 1 }
	);
	res.status(200).json(image.images[0]);
}));

//Upload an image
router.post(
	"/",
	upload.array("image"),
	isLoggedInReject,
	catchAsync(async (req, res) => {
		let image = { url: req.files[0].path, filename: req.files[0].filename };
		const user = await User.findByIdAndUpdate(
			req.body.userid,
			{ $push: { images: image } },
			{
				runValidators: true,
				new: true,
			}
		);
		res.status(201).json(user);
	})
);

// Delete an image
router.delete(
	"/:id",
	isLoggedInReject,
	catchAsync(async (req, res, next) => {
		let image = await User.findOne(
			{ "images._id": req.params.id },
			{ "images.$": 1 }
		);
		console.log("image: ", image.images[0].filename);

		let result = await User.findOneAndUpdate(
			{ _id: req.user._id },
			{
				$pull: { images: { _id: req.params.id } },
			}
		);
		await cloudinary.uploader.destroy(image.images[0].filename);
		res.status(204).end();
	})
);

module.exports = router;
