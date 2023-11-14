const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const morgan=require('morgan')
const dotenv=require('dotenv')
const authRoutes=require('../Task-node/Routes/authRoutes')
const path = require('path');

require('dotenv').config();
const app = express();
//middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, 'upload')));
app.use(express.urlencoded({ extended: false }));
//routes
app.use("/api/v1/auth", authRoutes);

//rest api
app.get("/", (req, res) => {
  res.send("<h1>role-based auth</h1>");
});

//Database connect to locally
mongoose.connect(process.env.DB)//DB is define in env file
const db=mongoose.connection;
db.on('error',(error)=>console.log(error))
db.once('open',()=> console.log('connected to database'))

//PORT
const PORT = process.env.PORT || 3001;

//run listen
app.listen(PORT, () => {
  console.log(
    `Server Running on port ${PORT}`
  );
});