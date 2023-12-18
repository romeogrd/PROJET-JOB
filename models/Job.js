const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    jobtitle: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true,
    },
    website: {
        type: String,
        required: true,
    },
    nameEmployer: {
        type: String,
    },
    emailEmployer: {
        type: String,
    },
    phoneEmployer: {
        type: String,
    },
    adressEmployer: {
        type: String,
    },
    origin: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    comments: {
        type: String,
    },
});


jobSchema.post('save', function(doc, next) {
    console.log('new job was created and saved', doc);
    next();
});

const Job = mongoose.model('job', jobSchema);

module.exports = Job; 