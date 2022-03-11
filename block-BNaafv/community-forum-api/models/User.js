var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, trim: true, unique: true },
    password: { type: String, minlength: 5, required: true },
    bio: { type: String, default: null },
    name: { type: String, default: null },
    image: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    answers: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    upvotedQuestions: [{ type: mongoose.Types.ObjectId, ref: "Question" }],
    upvotedAnswers: [{ type: mongoose.Types.ObjectId, ref: "Answer" }],
    comments: [{ type: mongoose.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.verifyPassword = async function (password) {
  try {
    const result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    res.status(400).send(error);
  }
};

userSchema.methods.createToken = async function () {
  try {
    let payload = {
      userId: this.id,
      username: this.username,
    };

    let user = await User.findOne({ userId: this.id });
    console.log(user, `sdjklsa`);
    if (user.isAdmin) {
      payload.isAdmin = true;
    } else {
      payload.isAdmin = false;
    }

    let token = await jwt.sign(payload, process.env.SECRET);

    return token;
  } catch (error) {
    return error;
  }
};

userSchema.methods.userJSON = function (token) {
  return {
    username: this.username,
    email: this.email,
    token: token,
  };
};

userSchema.methods.profileJSON = function () {
  return {
    name: this.name,
    username: this.username,
    bio: this.bio,
    image: this.image,
  };
};

let User = mongoose.model("User", userSchema);

module.exports = User;
