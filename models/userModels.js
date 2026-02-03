const mongoose = require('mongoose');

const user= new mongoose.Schema ({
    firstName:String,
    lastName : String,
    email: String,
    password: String,
    age: Number,
    gender: String,

});

const userModel= mongoose.model('User',user)

module.exports=userModel;