const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

firstname: { type: String,
     required: true },

 lastname: { type: String,
     required: true },

 email: { type: String, 
    trim: true, 
    lowercase: true,
     unique: true, required: 'Email address is required' },

 profileImage: { type: String,
     required: true, },

 phone: { trim: true, 
    type: String, 
    required: 'Intern mobile is required', unique: true },

  password: { type: String,
     required: true },

    address: {
        shipping: {
            street: { type: String },
            city: { type: String },
            pincode: { type: Number }
        },

        billing: {
            street: { type: String },
            city: { type: String },
            pincode: { type: Number}
        }
    }

}, { timestamps: true });

module.exports = mongoose.model('UserData',userSchema)
