const express = require("express");
const app = express();
const tweets = require("./routes/tweets");
const home = require("./routes/home");
const messages = require('./routes/messages')
const users = require('./routes/users')
const favorites = require('./routes/favorites')
app.use(express.json());

app.use('/', home);
app.use('/tweets', tweets);
app.use('/favorites', favorites)
app.use('/users', users)
app.use('/messages', messages)

app.use("*", (req, res, next) => {
  res.status(404).send("404 page not found");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Listening on port: ", port);
});
