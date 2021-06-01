const mongoose = require("mongoose");
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
	},
	// I'm going to skip images for now
	favorites: [{ type: Schema.Types.ObjectId, ref: "Tweet" }],
	tweets: [{ type: Schema.Types.ObjectId, ref: "Tweet" }],
	followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
	following: [{ type: Schema.Types.ObjectId, ref: "User" }],
	DMs: [{ type: Schema.Types.ObjectId, ref: "DM" }],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
