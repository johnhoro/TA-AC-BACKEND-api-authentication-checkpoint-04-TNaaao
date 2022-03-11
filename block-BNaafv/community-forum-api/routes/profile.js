var express = require("express");
const User = require("../models/User");
var router = express.Router();

const auth = require("../middlewares/auth");

//get User information

router.get("/:username", auth.isLoggedIn, async (req, res, next) => {
  let givenUsername = req.params.username;
  try {
    let userInfo = await User.findOne({ username: givenUsername });
    if (!userInfo) {
      return res.status(400).json({ error: "invalid username" });
    }
    res.json({ profile: userInfo.profileJSON() });
  } catch (error) {
    next(error);
  }
});

//update User information

router.put("/:username", auth.isLoggedIn, async (req, res, next) => {
  let givenUsername = req.params.username;

  try {
    let data = req.body;

    let updateUser = await User.findOne({ username: givenUsername });
    console.log(updateUser);
    if (!updateUser) {
      res.json({
        error: "user not found",
      });
    }

    if (updateUser && updateUser.id === data.user.userId) {
      let updatedUser = await User.findOneAndUpdate(
        { username: givenUsername },
        data,
        { new: true }
      );

      console.log(updatedUser);
      res.json({ user: updatedUser.userJSON() });
    }

    res.json({ error: "you are not have permiision to perform this action" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
