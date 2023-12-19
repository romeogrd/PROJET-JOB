const express = require('express');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const authRoutes = require('./routes/authRoutes');
const app = express();

const path = require('path');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');



app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));

app.use(express.json());
app.use(cookieParser());
app.use(checkUser);
app.use(authRoutes);

require('dotenv').config();


app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

//db connection
mongoose.connect(process.env.MONGODB_URI)
    .then((result) => app.listen(3000))
    .then(console.log('Connect to the database'))
    .catch((err) => console.log(err));




  

app.get('*', checkUser);
app.get(['/', '/index'], checkUser, requireAuth, async (req, res) => res.render('index'));
app.get(['/newjob'], checkUser, requireAuth, (req, res) => res.render('newjob'));
app.get(['/myprofile'], checkUser, requireAuth, (req, res) => res.render('myprofile'));
app.get(['/jobdetail'], checkUser, requireAuth, (req, res) => res.render('jobdetail'));
app.get(['/jobupdate'], checkUser, requireAuth, (req, res) => res.render('jobupdate'));







module.exports = app;