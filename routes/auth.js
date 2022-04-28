const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require("../middleware/fetchuser");


const JWT_SECRET = "mysecretcode";


// ROUTE 1:
// Creating a User using: POST "/api/auth/createuser". No Login Required
router.post(
  "/createuser",
  [
    body("name", "Enter a valid Name atleast 3 characters long").isLength({
      min: 3,
    }),
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {

    let success = false;

    // If there are errors, return Bad Request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    // Everything wrapped under a try catch so as to get error if anything is wrong in our server side.
    try {
      // Check whether the user with this Email exists, already
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success, error: "A user with this email Already Exists." });
      }

      const salt = await bcrypt.genSalt(10);
      const securedPassword = await bcrypt.hash(req.body.password, salt);
      
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securedPassword
      });
      const data = {
          user: {
              id: user._id
          }
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({success, authToken});

    } catch (error) {
      console.log(error.message);
      res.status(500).send({success, error:"Some error occured on the server side"});
    }
  }
);


// ROUTE 2:
// Logging in a user using POST "/api/auth/login". No login required
router.post(
  "/login",
  [
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password must be non Empty").exists()
  ],
  async (req, res) => {

    let success = false;

    // If there are errors, return Bad Request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {email, password} = req.body;

    // Everything wrapped under a try catch so as to get error if anything is wrong in our server side.
    try {
      // Check whether the user with this Email exists
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({success , error: "Please try to login with correct credentials" });
      }
      
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ success , error: "Please try to login with correct credentials" });
      }
      const data = {
          user: {
              id: user._id
          }
      };
      const authToken = jwt.sign(data, JWT_SECRET);

      success = true;
      res.json({success, authToken});

    } catch (error) {
      console.log(error.message);
      res.status(500).send("Some error occured on the server side");
    }
  }
);


// ROUTE 3:
// Getting all the information of a Logged in user, using GET "/api/auth/getuser". Login required.
router.post("/getuser", fetchuser,async (req, res) => {

  let success = false;

    // Everything wrapped under a try catch so as to get error if anything is wrong in our server side.
    try {
      const userId = req.user._id;
      let user = await User.findOne(userId).select("-password");
      success = true;
      res.send({success, user});
    } catch (error) {
      console.log(error.message);
      res.status(500).send({success, error: "Some error occured on the server side"});
    }
  }
);

module.exports = router;