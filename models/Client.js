const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    zipCode: {
        type: String,
        required: true,
        trim: true
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
            validator: function(v) {
                return v.length === 2;
            },
            message: 'Coordinates must be [longitude, latitude]'
        }
    },
    description: {
        type: String,
        trim: true
    },
    industry: {
        type: String,
        trim: true
    },
    partnershipSince: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear()
    },
    images: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
clientSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Client', clientSchema);