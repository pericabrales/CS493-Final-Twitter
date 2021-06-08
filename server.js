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
const images = require("./routes/images");
const followers = require("./routes/followers");
const { mongoURL } = require("./lib/mongo");
const ExpressError = require("./utils/ExpressError");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const session = require("express-session");
const redis = require("redis");

const rateLimitWindowMS = 60000;
const rateLimitMaxRequests = 5;
const rateLimitMaxRequestsLogged = 10;

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

// getting redis server set up for rate limiting stuff

const redisClient = redis.createClient(
	process.env.REDIS_PORT || "6379",
	process.env.REDIS_HOST || "localhost"
);

// All of the professor's rate-limiting stuff (that we borrowed)

function saveUserTokenBucket(ip, tokenBucket) {
	return new Promise((resolve, reject) => {
		redisClient.hmset(ip, tokenBucket, (err, resp) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

function getUserTokenBucket(ip) {
	return new Promise((resolve, reject) => {
		redisClient.hgetall(ip, (err, tokenBucket) => {
			if (err) {
				reject(err);
			} else if (tokenBucket) {
				tokenBucket.tokens = parseFloat(tokenBucket.tokens);
				resolve(tokenBucket);
			} else {
				resolve({
					tokens: rateLimitMaxRequests,
					last: Date.now(),
				});
			}
		});
	});
}

async function rateLimit(req, res, next) {
	try {
		const tokenBucket = await getUserTokenBucket(req.ip);

		const currentTimestamp = Date.now();
		const ellapsedTime = currentTimestamp - tokenBucket.last;
		if (req.user) {
			
			tokenBucket.tokens +=
				ellapsedTime * (rateLimitMaxRequestsLogged / rateLimitWindowMS);
			tokenBucket.tokens = Math.min(
				tokenBucket.tokens,
				rateLimitMaxRequestsLogged
			);
			tokenBucket.last = currentTimestamp;
		} else {
			
			tokenBucket.tokens +=
				ellapsedTime * (rateLimitMaxRequests / rateLimitWindowMS);
			tokenBucket.tokens = Math.min(tokenBucket.tokens, rateLimitMaxRequests);
			tokenBucket.last = currentTimestamp;
		}
		console.log(tokenBucket.tokens);

		if (tokenBucket.tokens >= 1) {
			tokenBucket.tokens -= 1;
			await saveUserTokenBucket(req.ip, tokenBucket);
			next();
		} else {
			return res.status(429).send({
				error: "Too many request per minute.  Please wait a bit...",
			});
		}
	} catch (err) {
		next();
	}
}

app.use("/", home);
app.use("/users", users);
app.use(rateLimit);
app.use("/followers", followers)
app.use("/tweets", tweets);
app.use("/favorites", favorites);
app.use("/users", users);
app.use("/messages", messages);
app.use("/images", images);


app.all("*", (req, res, next) => {
	next(new ExpressError("Page Not Found", 404));
});

// This endpoint handles all other errors
app.use((err, req, res, next) => {
	let { statusCode = 500 } = err;
	if (!err.message) {
		err.message = "Something went wrong.";
	}
	if (err.name == "CastError") {
		statusCode = 404;
		err.message = "Resource doesn't exist"
	} 
	else if (err.name == "ValidationError"){
		statusCode = 400;
		err.message = "Fields omitted or not filled out correctly."
	}
	console.log(err);
	console.log("status Code: ", statusCode);
	res.status(statusCode).json({ error: err.message });
});
const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log("Listening on port: ", port);
});
