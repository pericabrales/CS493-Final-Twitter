const User = require("../models/user");
const Tweet = require("../models/tweet");

//to get the array of the user's favorites
async function getAllUsersFaves(id, page){
    const user = await User.findById(id).populate("favorites");

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
}
exports.getAllUsersFaves = getAllUsersFaves;
