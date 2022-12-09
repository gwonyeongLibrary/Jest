const express = require("express");
const app = express();

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send("Require login");
  }
};

// ---------------
const User = require("./models/User.js");

const get_user_status = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { name: req.user.name } });
    if (user) {
      await user.get_age(parseInt(req.params.id, 10));
      res.send("success");
    } else {
      res.status(404).send("no user");
    }
  } catch (err) {
    console.log(err);
    res.send(err);
  }
};

module.exports = { isLoggedIn, get_user_status, app };
