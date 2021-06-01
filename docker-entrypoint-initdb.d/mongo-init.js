// Database initialization info necessary to set up the mongodb container

db.createUser({
	user: "twitter",
	pwd: "pass",
	roles: [
		{
			role: "readWrite",
			db: "twitter-data",
		},
	],
});
