const User = require("../models/user");
const Tweet = require("../models/tweet");

//to get the array of the user's favorites
async function getAllUsersFaves(id, page){
    //get all of the user's info
    const user = await User.findById(id);
    console.log("user: ", user);

    //CANNOT TEST IF STATEMENT UNTIL TWEETS ARE SET UP

    //check to make sure the favorites isn't null
    //if(user.favorites.count){
        console.log("user favorites: ", user.favorites);
        //need pagination (just the page thing)
        console.log("favorites count", user.favorites.count);
        const count = user.favorites.count;
        const pageSize = 10;
        const lastPage = Math.ceil(count / pageSize);
        page = page > lastPage ? lastPage : page;
        page = page < 1 ? 1 : page;
        const offset = (page - 1) * pageSize;
        const arraySplit = user.favorites.slice(offset, (page*pageSize));

        //Populate isn't showing just the user's favorites array, so try again when we have tweets

        // const results = await User.findById(id).populate('favorites').slice(offset, (page*pageSize));
        //const results = user.populate("favorites");
        console.log("results: ", results);
        return{
            favorites: arraySplit,
            page: page,
            totalPages: lastPage,
            pageSize: pageSize,
            count: count
        };
    //}
    //if its an empty array, just send back 0s and stuff to make it not look gross
    // else{
    //     console.log("in else");
    //     return{
    //         favorites: [],
    //         page: 0,
    //         totalPages: 0,
    //         pageSize: 0,
    //         count: 0
    //     };
    // }
}
exports.getAllUsersFaves = getAllUsersFaves;

//to insert a tweet into the favorites array
async function insertTweetToFave(userid, tweetid){
    //get the user by id
    const user = await User.findById(userid);
    //get the tweet by id
    const tweet = await Tweet.findById(tweetid);

    //found online
    const result = await user.update({_id: userid},
        {$push: {favorites: tweet}},
        done
    );

    //insert the tweet into the the user's favorites array
    //user.favorites.push(tweet);

    return result;
}
exports.insertTweetToFave = insertTweetToFave;
