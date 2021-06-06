const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const Tweet = require("../models/tweet");
const { getAllUsersFaves, insertTweetToFave } = require("../models/favorite");
const catchAsync = require("../utils/catchAsync");
const { isLoggedInReject, isLoggedInAccept } = require("../middleware");

//get request for listing a user's favorite tweets (should be in an array)
router.get("/", isLoggedInReject, catchAsync( async(req, res) => {
  console.log("user id: ", req.user.id);
    //get the favorites of the user also with pagination
    const faves = await getAllUsersFaves(req.user.id, (req.query.page || 1));
    console.log("after getAllUsersFaves call");
    //links for the pagination of the favorites
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

//Post request for favoriting a tweet by the tweet id
//should also update the tweet's favorites array (I think)
router.post('/:tweetid', isLoggedInReject, catchAsync(async(req, res) => {
  console.log("user id: ", req.user.id);
    //insert the new tweet to favorite array
    await User.updateOne({_id: req.user.id},
      {$push: {favorites: req.params.tweetid}}
    );

    //just sending back the link to the tweet that they favorited in case they want to see it again
    res.status(200).send({
      links: {
        favoriteTweet: `/tweets/${req.params.tweetid}`
      }
    });
}));

//delete request for unfavoriting a tweet by id
router.delete('/:tweetid', isLoggedInReject, catchAsync(async(req, res) => {
  console.log("user id: ", req.user.id);

  //delete tweet from favorite array
  await User.updateOne({_id: req.user.id},
    {$pull: {favorites: req.params.tweetid}}
);

res.status(204).end();

}));

//get request for getting a specific favorited tweet
// router.get('/:tweetid', isLoggedInReject, catchAsync(async(req, res) => {
  
// }));

module.exports = router;
