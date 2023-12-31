const mongoose = require('mongoose');
const Job = require('./Job')
const { isEmail } = require('validator');

const bcrypt = require('bcryptjs');




const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Minimum password length is 6 characters']
    },
    firstname: {
        type: String,
        required: [true, 'Please enter your first name'],
    },
    lastname: {
        type: String,
        required: [true, 'Please enter your last name'],
    },
    github: {
        type: String,
    },
    jobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
    }],
});

//fire a function after doc saved to db
userSchema.post('save', function (doc, next) {
    console.log('new user was created and saved', doc);
    next();
});

// fire a function before doc saved to db
 userSchema.pre('save', async function (next) {     console.log('user about to be created or saved', this);     if (!this.isModified('password')) {         return next();     }     const salt = await bcrypt.genSalt();     this.password = await bcrypt.hash(this.password, salt);     next() })

// static method to login user

userSchema.statics.login = async function (email, password) {
    console.log('Email dans la méthode login :', email);
    console.log('Mot de passe dans la méthode login :', password);
    const user = await this.findOne({ email });

    if (user) {
        console.log('Mot de passe stocké en base de données :', user.password);
        const auth = await bcrypt.compare(password, user.password);
        console.log('Résultat de la comparaison de mot de passe :', auth);


        if (auth) {
            return user;
        }
        console.log('La comparaison du mot de passe a échoué');
        throw Error('incorrect password');
    }

    throw Error('incorrect email');
};


const User = mongoose.model('User', userSchema);

module.exports = User; 
