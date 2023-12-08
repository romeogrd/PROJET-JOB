const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const app = express();
const dotenv = require("dotenv");
const path = require('path');
const cookieParser = require('cookie-parser');


app.use (express.urlencoded({ extended: true}));

app.use(express.static(__dirname + '/public/')); //pour les img et le css
app.use (express.json());
app.use(cookieParser());

require('dotenv').config();


app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

//db connection
mongoose.connect(process.env.MONGODB_URI)
.then((result) => app.listen(3000))
.then(console.log('Connect to the database'))
.catch((err) => console.log(err));

 // cookies


app.use(authRoutes);



module.exports = app;