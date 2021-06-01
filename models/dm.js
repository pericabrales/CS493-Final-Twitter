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
    // Leaving out messages for now; I've gotta figure out how to set this part up.

});


const DM = mongoose.model("DM", dmSchema);
module.exports = DM;