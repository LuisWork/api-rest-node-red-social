const Follow = require("../models/follow");

const followUserIds = async (identityUserId) => {
  try {
    let following = await Follow.find({ "user": identityUserId })
      .select({ "followed": 1, "_id": 0 })
      .exec();
    let followers = false;
    return {
      following,
      followers,
    };
  } catch (error) {
    return {};
  }
};

const followThisUser = async (identityUserId, profileUserId) => {};

module.exports = {
  followUserIds,
  followThisUser,
};
