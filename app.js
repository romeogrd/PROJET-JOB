const express = require('express');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const authRoutes = require('./routes/authRoutes');
const app = express();

const path = require('path');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');



app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public')); //pour les img et le css  
/* app.use('/public', express.static('public')); */
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


// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
    console.error('Erreur globale:', err);

    // Vérifiez si la requête accepte le JSON
    if (req.accepts('json')) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Sinon, renvoie une page d'erreur HTML
    res.status(500).send('Internal Server Error');
});


app.get('*', checkUser);
app.get(['/', '/index'], checkUser, requireAuth, async (req, res) => res.render('index'));
app.get(['/newjob'], checkUser, requireAuth, (req, res) => res.render('newjob'));
app.get(['/myprofile'], checkUser, requireAuth, (req, res) => res.render('myprofile'));
app.get(['/jobdetail'], checkUser, requireAuth, (req, res) => res.render('jobdetail'));
app.get(['/jobupdate'], checkUser, requireAuth, (req, res) => res.render('jobupdate'));







module.exports = app;