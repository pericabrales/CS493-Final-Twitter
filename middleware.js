module.exports.isLoggedInReject = (req, res, next) => {
	if (!req.isAuthenticated()) {
		const statusCode = 401;
		console.log("status Code: ", statusCode);
		return res.status(statusCode).json({ error: "Not Logged in." });
	}
	next();
};

module.exports.isLoggedInAccept = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.logged = false;
		return next();
	}
	req.logged = true;
	next();
};
