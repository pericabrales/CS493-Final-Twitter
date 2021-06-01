if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

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
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const session = require("express-session");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const sessionConfig = {
	secret: "teenagemutantninjaturtles",
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};

// We use the flash module to assist in error handeling
app.use(session(sessionConfig));

// A bunch of passport setup/init stuff
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
mongoose.connect(mongoURL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

app.use("/", home);
app.use("/tweets", tweets);
app.use("/favorites", favorites);
app.use("/users", users);
app.use("/messages", messages);

app.all("*", (req, res, next) => {
	next(new ExpressError("Page Not Found", 404));
});

// This endpoint handles all other errors
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) {
		err.message = "Something went wrong.";
	}
	console.log("status Code: ", statusCode);
	res.status(statusCode).json({ error: err });
});
const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log("Listening on port: ", port);
});
