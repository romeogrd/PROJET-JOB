const User = require('../models/User');
const jwt = require ('jsonwebtoken');
const Job = require('../models/Job');
/* const { checkUser } = require('../middleware/authMiddleware'); */


//handle errors

const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '', lastname: '', firstname:''};

    //incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'that email is not registered';
    }

    //incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'that password is incorrect';
    }

    //duplicate error code
    if(err.code === 11000) {
        errors.email ='That email is already registered';
        return errors;
    }

    // validation errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'romeo secret', {
        expiresIn: maxAge
    });
}
 

module.exports.signup_get = (req,res) => {
    res.render('signup');
}

module.exports.login_get = (req,res) => {
    res.render('login');
}

module.exports.signup_post = async (req,res) => {
    const { email, password, firstname, lastname, github } = req.body;
    
    try {
        const user = await User.create({ email, password, firstname, lastname, github });
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000});
        res.status(201).json({ user: user._id });
    }
    catch(err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.login_post = async (req,res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000});
        res.status(200).json({user: user._id });
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.index_get = async (req, res) => {
    try {
        const user = res.locals.user;
        console.log('User in index_get:', user);
        // Vérifiez si user et user.jobs sont définis
        if (user && user.jobs && user.jobs.length > 0) {
            const userJobId = user.jobs[0]._id;

            // Vérifiez si user.jobs[0]._id est défini
            if (userJobId) {
                const jobs = await Job.find({ _id: userJobId }).exec();
                res.render('index', { user, jobs });
            } else {
                res.render('index', { user: null, jobs: [] });
            }
        } else {
            res.render('index', { user: null, jobs: [] });
        }
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
};

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1});
    res.redirect('/');
}

module.exports.newjob_get = (req, res) => {
    res.render('newjob');
}

module.exports.newjob_post = async (req,res) => {
    const { jobtitle, website, nameEmployer, emailEmployer, phoneEmployer, adressEmployer, origin, status, comments } = req.body;
    
    try {
        const currentUser = res.locals.user; 
        console.log('Current User:', currentUser);
        const job = await Job.create({ jobtitle, website, nameEmployer, emailEmployer, phoneEmployer, adressEmployer, origin, status, comments });

        
        currentUser.jobs.push(job);

        await currentUser.save();
        res.status(201).json({ job: job._id });

    }
    catch(err) {
      const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}