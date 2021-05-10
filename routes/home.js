const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("hello world this is the home page");
});

module.exports = router;
