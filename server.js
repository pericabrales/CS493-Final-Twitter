const express = require("express");
const app = express();
const mongoose = require("mongoose");
const tweets = require("./routes/tweets");
const home = require("./routes/home");
const messages = require("./routes/messages");
const users = require("./routes/users");
const favorites = require("./routes/favorites");
const { mongoURL } = require("./lib/mongo");
const ExpressError = require("./utils/ExpressError");

app.use(express.json());

app.use("/", home);
app.use("/tweets", tweets);
app.use("/favorites", favorites);
app.use("/users", users);
app.use("/messages", messages);

console.log(mongoURL);
mongoose.connect(mongoURL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

app.all("*", (req, res, next) => {
	next(new ExpressError("Page Not Found", 404));
});

// This endpoint handles all other errors
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) {
		err.message = "Something went wrong.";
	}
	res.status(statusCode).render("error", { err });
});
const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log("Listening on port: ", port);
});
