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
			date: { type: Date, required: true },
		},
	],
});

// function checkIfAlreadyMessaged (user1, user2){
// 	const arr = user1.DMs;
//     const arr2 = user2.DMs;
//     arr.forEach((value) => {
//       arr2.forEach((value2) => {
//         if (JSON.stringify(value) === JSON.stringify(value2)) {
//           return true
//         }
//       });
//     });
// 	return false
// }
// module.exports.checkIfAlreadyMessaged = checkIfAlreadyMessaged

const DM = mongoose.model("DM", dmSchema);
module.exports = DM;
