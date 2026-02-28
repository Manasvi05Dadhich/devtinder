const mongoose = require('mongoose');
const bcrypt= require('bcrypt')

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    age: {
      type: Number
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'others']
    },

    skills: {
      type: [String]
    },

    about: {
      type: String
    },

    photoUrl: {
      type: String
    },
    
    resetPasswordToken: {
     type: String,
      default: null
},

    resetPasswordExpires: {
      type: Date,
      default: null
}  
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;