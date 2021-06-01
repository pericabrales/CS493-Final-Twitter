const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dmSchema = new mongoose.Schema({
	userid1: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	userid2: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	messages: [
		{
			senderid: { type: Schema.Types.ObjectId, ref: "User", required: true },
			message: { type: String, required: true },
			date: {type: Date, required: true}
		},
	],
});

const DM = mongoose.model("DM", dmSchema);
module.exports = DM;
