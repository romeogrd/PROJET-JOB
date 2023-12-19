const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = (req, res, next) => {

    const token = req.cookies.jwt;

    // check json web token exists and verifies
    if (token) {
        jwt.verify(token, 'romeo secret', (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/login')
            } else {
                console.log(decodedToken);
                next();
            }
        })
    }
    else {
        res.redirect('/login')
    }
}


//check current user
const checkUser = (req, res, next) => {
    console.log('Middleware checkUser: Début du traitement de la demande');
    const token = req.cookies.jwt;

    if(token) {
        jwt.verify(token, 'romeo secret', async (err, decodedToken) => {
            console.log('Token décodé:', decodedToken);
            if (err) {
                console.log(err.message);
                res.locals.user = null;
                console.log('User not found');
                next();
            } else {
                console.log(decodedToken);
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                console.log('User found:', user);
                next();
            }
        })
    }
    else {
        console.log('Aucun jeton trouvé dans les cookies');
        res.locals.user = null;
        next();
    }
}

module.exports = { requireAuth, checkUser };
