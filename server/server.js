// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path')
const User = require('./models/user.model')
const routes = require('./routes/route');
 
require("dotenv").config({
 path: path.join(__dirname, "../.env")
});
 
const app = express();
 
const PORT = process.env.PORT || 4000;
 
mongoose
 .connect('mongodb://localhost:27017/rbac')
 .then(() => {
  console.log('Connected to the Database successfully');
 });
 
app.use(bodyParser.urlencoded({ extended: true }));
 
app.use(async (req, res, next) => {
 if (req.headers["x-access-token"]) {
  const accessToken = req.headers["x-access-token"];
  const { userId, exp } = await jwt.verify(accessToken, process.env.JWT_SECRET);
  console.log(userId, exp);
  // Check if token has expired
  if (exp < Date.now().valueOf() / 1000) { 
   return res.status(401).json({ error: "JWT token has expired, please login to obtain a new one" });
  } 
  res.locals.loggedInUser = await User.findById(userId); next(); 
  // console.log(res.locals.loggedInUser);
 } else { 
  next(); 
 } 
});
 
app.use('/', routes);

app.listen(PORT, () => {
  console.log('Server is listening on Port:', PORT)
})