const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Tweets");
});






module.exports = router;
