var express = require("express");
var router = express.Router();
const User = require("../models/User");
const auth = require("../middlewares/auth");

router.get("/", async (req, res) => {
  try {
    var user = await User.find({});
    res.json({ user: user });
  } catch (error) {
    return error;
  }
});

/* register user */

router.post("/register", async (req, res) => {
  try {
    var user = await User.create(req.body);
    console.log(user);
    var token = await user.createToken();
    console.log(token);
    res.json({ user: user.userJSON(token) });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

//login user

router.post("/login", async function (req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email/password required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Email is not registered" });
    }
    const result = await user.verifyPassword(password);
    if (!result) {
      return res.status(400).json({ error: "Incorrect Password" });
    }
    var token = await user.createToken();
    res.json({ user: user.userJSON(token) });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

//get current user

router.get("/current-user", auth.isLoggedIn, async (req, res, next) => {
  let payload = req.user;

  var token = req.headers.authorization?.split(" ")[1] || null;
  console.log(payload, token);
  try {
    let user = await User.findOne({ userId: payload.userId });
    res.json({ user: await user.userJSON(token) });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//follow user

router.post("/:userId/follow", auth.isLoggedIn, async (req, res, next) => {
  let userId = req.params.userId;
  let loggedprofile = req.user;
  console.log(userId, loggedprofile.userId);
  try {
    let loggedUser = await User.findOne({ userId: loggedprofile.userId });
    if (userId === loggedUser.id) {
      return res.status(400).json({ error: "you cannot follow yourself" });
    } else if (loggedUser.following.includes(userId)) {
      return res
        .status(400)
        .json({ error: "you can not follow same person twice" });
    } else {
      let updatedTargetUser = await User.findByIdAndUpdate(userId, {
        $push: { followers: loggedUser.id },
      });

      let updatedUser = await User.findByIdAndUpdate(loggedUser.id, {
        $push: { following: userId },
      });

      return res.json({ updatedUser, updatedTargetUser });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//unfollow user

router.post("/:userId/unfollow", auth.isLoggedIn, async (req, res, next) => {
  let userId = req.params.userId;
  let loggedprofile = req.user;
  try {
    let loggedUser = await User.findOne({ userId: loggedprofile.userId });

    if (userId === loggedUser.id) {
      return res.status(400).json({ error: "you cannot unfollow yourself" });
    } else if (!loggedUser.following.includes(userId)) {
      return res
        .status(400)
        .json({ error: "you can not unfollow same person twice" });
    } else {
      let updatedTargetUser = await User.findByIdAndUpdate(userId, {
        $pull: { followers: loggedUser.id },
      });

      let updatedUser = await User.findByIdAndUpdate(loggedUser.id, {
        $pull: { following: userId },
      });

      return res.json({ updatedUser, updatedTargetUser });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//block user by admin

router.post("/block/:username", auth.isAdmin, async (req, res, next) => {
  let username = req.params.username;
  console.log(username, `john`);
  try {
    let updatedProfile = await User.findOneAndUpdate(
      { username },
      { isBlocked: true }
    );

    return res.json({ updatedProfile });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//unblock user by admin

router.post("/unblock/:username", auth.isAdmin, async (req, res, next) => {
  let username = req.params.username;

  try {
    let updateduser = await User.findOneAndUpdate(
      { username },
      { isBlocked: false }
    );

    let updatedProfile = await User.findOneAndUpdate(
      { username },
      { isBlocked: false }
    );

    return res.json({ updatedProfile });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
