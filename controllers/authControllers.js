const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Job = require('../models/Job');
/* const { checkUser } = require('../middleware/authMiddleware'); */


//handle errors

const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '', lastname: '', firstname: '' };

    //incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'that email is not registered';
    }

    //incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'that password is incorrect';
    }

    //duplicate error code
    if (err.code === 11000) {
        errors.email = 'That email is already registered';
        return errors;
    }

    // validation errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
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


module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.signup_post = async (req, res) => {
    const { email, password, firstname, lastname, github } = req.body;

    try {
        const user = await User.create({ email, password, firstname, lastname, github });
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;
    console.log('Email fourni par l\'utilisateur :', email);
    console.log('Mot de passe fourni par l\'utilisateur :', password);
    try {

        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id });
    }
    catch (err) {
        const errors = handleErrors(err);
        console.log('Errors:', errors);
        res.status(400).json({ errors });
    }
}

module.exports.index_get = async (req, res) => {
    try {
        const user = res.locals.user;
        console.log('User in index_get:', user);

        if (user) {
            const jobsDetails = await Promise.all(
                user.jobs.map(async (jobId) => {
                    try {
                        const job = await Job.findById(jobId).exec();
                        console.log('Job details:', job);
                        return job;
                    } catch (error) {
                        console.error('Error fetching job details:', error);
                        return null;
                    }
                })
            );

            console.log('Jobs details:', jobsDetails);
            res.locals.jobs = jobsDetails;
            res.render('index', { user, jobs: jobsDetails });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error in index_get:', error);
        res.status(500).send(`Error: ${error.message}`);
    }
};



module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/login');
}

module.exports.newjob_get = (req, res) => {
    res.render('newjob');
}

module.exports.newjob_post = async (req, res) => {
    const { jobtitle, website, company, nameEmployer, emailEmployer, phoneEmployer, adressEmployer, origin, status, comments } = req.body;

    try {
        const currentUser = res.locals.user;
        console.log('Current User:', currentUser);
        const job = await Job.create({ jobtitle, website, company, nameEmployer, emailEmployer, phoneEmployer, adressEmployer, origin, status, comments });


        currentUser.jobs.push(job);

        await currentUser.save();
        res.status(201).json({ job: job._id });

    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}


module.exports.jobdetail_get = async (req, res) => {
    const jobId = req.params.jobId;

    try {
        const job = await Job.findById(jobId).exec();

        if (job) {
            res.render('jobdetail', { job }); // Render a job detail page with the job details
        } else {
            res.status(404).send('Job not found');
        }
    } catch (error) {
        console.error('Error fetching job details:', error);
        res.status(500).send('Internal Server Error');
    }
};


module.exports.jobdetail_delete = async (req, res) => {
    const jobId = req.params.jobId;
    await Job.findByIdAndDelete(jobId);

    // Remove the job id from the job array in the user collection
    await User.updateMany(
        { jobs: jobId },
        { $pull: { jobs: jobId } }
    );
 
    await res.json({ message: 'Job deleted successfully' });
    
 };



module.exports.jobupdate_get = async (req, res) => {
    const jobId = req.params.jobId;

    try {
        const job = await Job.findById(jobId).exec();

        if (job) {
            res.render('jobupdate', { job });
        } else {
            res.status(404).send('Job not found');
        }
    } catch (error) {
        console.error('Error fetching job details for update:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports.jobupdate_post = async (req, res) => {
    const jobId = req.params.jobId;

    try {
        // Find the job by ID
        const job = await Job.findById(jobId).exec();

        if (!job) {
            return res.status(404).send('Job not found');
        }

        // Update job details based on the form submission
        job.jobtitle = req.body.jobtitle;
        job.company = req.body.company;
        job.website = req.body.website;
        job.nameEmployer = req.body.nameEmployer;
        job.emailEmployer = req.body.emailEmployer;
        job.phoneEmployer = req.body.phoneEmployer;
        job.adressEmployer = req.body.adressEmployer;
        job.origin = req.body.origin;
        job.status = req.body.status;
        job.comments = req.body.comments;


        // Save the updated job
        await job.save();

        res.redirect(`/jobdetail/${jobId}`); // Redirect to the job detail page
    } catch (error) {
        console.error('Error updating job details:', error);
        res.status(500).send('Internal Server Error');
    }
};