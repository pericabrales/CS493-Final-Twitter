const express = require("express");
const router = express.Router();
const passport = require('passport');
const { getAllUsersFaves, insertTweetToFave } = require("../models/favorite");


//get request for listing a user's favorite tweets (should be in an array)
router.get("/", passport.authenticate('local'), async (req, res) => {
  console.log("user id: ", req.user.id);
  try{
    //get the favorites of the user also with pagination
    const faves = await getAllUsersFaves(req.user.id, (req.query.page || 1));
    console.log("after getAllUsersFaves call");
    //now make pagination also show up
    faves.links = {};
    if(faves.page < faves.totalPages){
      faves.links.nextPage = `/favorites?page=${faves.page+1}`;
      faves.links.lastPage = `/favorites?page=${faves.totalPages}`;
    }
    if(faves.page > 1){
      faves.links.prevPage = `/favorites?page=${faves.page-1}`;
      faves.links.firstpage = `/favorites?page=1`;
    }
    res.status(200).send(faves);
  }catch(err){
    console.error(err);
    res.status(500).send({
      error:"Error fetching favorites. Try again later"
    });
  }
});

//get request for getting a specific favorited tweet
router.get('/:tweetid', passport.authenticate('local'), async (req, res) => {

});


//Post request for favoriting a tweet by the tweet id
//should also update the tweet's favorites array (I think)
//authenticate needs a json of the username and password sent to it
router.post('/:tweetid', passport.authenticate('local'), async (req, res) => {
  console.log("user id: ", req.user.id);
  try{
    //insert the new tweet to favorite array
    //get the array index number back
    const faveIndex = await insertTweetToFave(req.user.id, req.params.tweetid);
    res.status(201).send({
      favoritesIndex: faveIndex,
      links: {
        favoriteTweet: `/favorites/${faveIndex}`
      }
    });
  }
  catch(err){
    console.error(err);
    res.status(500).send({
      error:"That is not a valid tweet id. Please try again."
    });
  }
});

//delete request for unfavoriting a tweet by id
router.delete('/:tweetid', passport.authenticate('local'), async (req, res) => {
  console.log("user id: ", req.user.id);
  try{
    //delete tweet from favorite array

  }
  catch(err){
    console.error(err);
    res.status(500).send({
      error:"That is not a valid tweet id. Please try again."
    });
  }
});

module.exports = router;
