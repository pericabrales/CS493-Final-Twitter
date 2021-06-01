const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
	phone: {
		type: String,
		required: true,
	},
	birth_date: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	images: [{ url: String, filename: String }],
	favorites: [{ type: Schema.Types.ObjectId, ref: "Tweet" }],
	tweets: [{ type: Schema.Types.ObjectId, ref: "Tweet" }],
	followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
	following: [{ type: Schema.Types.ObjectId, ref: "User" }],
	DMs: [{ type: Schema.Types.ObjectId, ref: "DM" }],
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
module.exports = User;
