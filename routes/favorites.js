const express = require("express");
const router = express.Router();

const User = require("../models/user");
const { getAllUsersFaves} = require("../models/favorite");
const catchAsync = require("../utils/catchAsync");
const { isLoggedInReject } = require("../middleware");

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

  //try to find the tweet in the user's favorites
  const findFave = await User.findById(req.user.id).findOne({favorites: {_id: req.params.tweetid}})
  //do not allow multiple favorites of the same tweet
  if(findFave){
    res.status(405).send({
      error: "That tweet has already been favorited, you can't favorite it again."
    });
  }
  else{
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
  }
}));

//delete request for unfavoriting a tweet by id
router.delete('/:tweetid', isLoggedInReject, catchAsync(async(req, res) => {
  console.log("user id: ", req.user.id);

    //try to find the tweet in the user's favorites
    const findFave = await User.findById(req.user.id).findOne({favorites: {_id: req.params.tweetid}})
    //only allow a delete if the tweet can be found
    if(findFave){
      //delete tweet from favorite array
      await User.updateOne({_id: req.user.id},
        {$pull: {favorites: req.params.tweetid}}
      );
      res.status(200).send("Tweet has been removed from the favorites array");
    }
    else{
      res.status(405).send({
        error: "That tweet doesn't exist in the favorites array, and therefore can't be deleted."
      });
    }

}));

//get request for getting a specific favorited tweet
// router.get('/:tweetid', isLoggedInReject, catchAsync(async(req, res) => {
  
// }));

module.exports = router;
