module.exports.isLoggedIn = (req, res, next) => {
    console.log("REQ.USER...", req.user)
	if (!req.isAuthenticated()) {
        // const statusCode = 401;
		// console.log("status Code: ", statusCode);
		// return res.status(statusCode).json({ error: "Not Logged in." });
        console.log("You aren't logged in, but you can keep going, bro.");
        return next();
	}
	next();
};
