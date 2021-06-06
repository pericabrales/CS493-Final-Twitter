const express = require("express");
const router = express.Router();
const passport = require('passport');
const { getAllUsersFaves, insertTweetToFave } = require("../models/favorite");
const catchAsync = require("../utils/catchAsync");
const { isLoggedInReject, isLoggedInAccept } = require("../middleware");

//get request for listing a user's favorite tweets (should be in an array)
router.get("/", isLoggedInReject, catchAsync( async(req, res) => {
  console.log("user id: ", req.user.id);
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

}));

//get request for getting a specific favorited tweet
router.get('/:tweetid', isLoggedInReject, catchAsync(async(req, res) => {

}));


//Post request for favoriting a tweet by the tweet id
//should also update the tweet's favorites array (I think)
//authenticate needs a json of the username and password sent to it
router.post('/:tweetid', isLoggedInReject, catchAsync(async(req, res) => {
  console.log("user id: ", req.user.id);
    //insert the new tweet to favorite array
    //get the array index number back
    const faveReturn = await insertTweetToFave(req.user.id, req.params.tweetid);
    res.status(201).send({
      id: faveReturn,
      links: {
        favoriteTweet: `/favorites/${faveReturn}`
      }
    });
}));

//delete request for unfavoriting a tweet by id
router.delete('/:tweetid', isLoggedInReject, catchAsync(async(req, res) => {
  console.log("user id: ", req.user.id);
  //delete tweet from favorite array

  //get the user by id
  const user = await User.findById(userid);

  //should be able to delete from here
  await user.update({_id: userid},
    {$pull: {favorites: {_id: req.params.tweetid}}},
    done
);

res.status(204).end();

}));

module.exports = router;
