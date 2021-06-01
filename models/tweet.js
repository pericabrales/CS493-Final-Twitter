const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tweetSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        maxlength: 280
    },
    favorites: [{ type: Schema.Types.ObjectId, ref: "User" }]
})

const Tweet = mongoose.model("Tweet", tweetSchema);
module.exports = Tweet;