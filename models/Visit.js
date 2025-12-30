const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    officeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Office',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    visitDate: {
        type: Date,
        required: true
    },
    purpose: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    attendees: [{
        type: String
    }],
    images: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Visit', visitSchema);