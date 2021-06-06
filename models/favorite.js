const User = require("../models/user");
const Tweet = require("../models/tweet");

//to get the array of the user's favorites
async function getAllUsersFaves(id, page){
    const user = await User.findById(id).populate("favorites");

    //CANNOT TEST IF STATEMENT UNTIL TWEETS ARE SET UP

    //check to make sure the favorites isn't null
    //if(user.favorites.count){
        console.log("user favorites: ", user.favorites);
        //need pagination (just the page thing)
        console.log("favorites count", user.favorites.length);
        const count = user.favorites.length;
        const pageSize = 10;
        const lastPage = Math.ceil(count / pageSize);
        page = page > lastPage ? lastPage : page;
        page = page < 1 ? 1 : page;
        const offset = (page - 1) * pageSize;

        return{
            favorites: user.favorites.slice(offset, offset+pageSize),
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
