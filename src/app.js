const express= require('express');
const connectDB = require('../config/database');
const app= express();
const User= require('../models/userModels');

app.use(express.json());
connectDB();

app.post('/signup', async (req,res)=>{
    const userObj = new User({
        firstName:"manasvi",
        lastName : "dadhich",
        email: "abc@123",
        password: "123",
        gender :"female",
    });
    try {
     await userObj.save();
     res.send('user added successfully');
    } catch (err) {
        console.log(err);
        res.send(err.message);
    }
});

app.get('/user', async (req, res)=>{ // to get one user by its email
    const userEmail =  req.body.email;
    try {
        const users = await User.find({email:userEmail});
        if (users.length === 0 ){
            res.send('user not found');
        }
        else{
            res.send(users);
        }
        
    } catch (error) {
        res.status(400).send('unable to get data'+ error.message);
    }
})

app.get('/feed', async (req, res)=> {//get all users
    try {
        const allUsers = await User.find({})
        res.send(allUsers);
    } catch (err) {
        console.log(err);
        res.send(err.message);
    }

})

app.delete('/user',async (req, res) => { //delete a user
    const userID = req.body.userID;
    try {
        const users = await User.findByIdAndDelete(userID);
        res.send('user deleted successfully');        
    } catch (err) {
        console.log(err);
        res.send(err.message);
    }
})

app.patch('/user', async (req, res)=>{
    const updateUser = req.body
    try {
        
    } catch (err) {
        console.log(err);
        res.send(err.message);
    }
})




app.listen(7777, () => {
  console.log("Server running on port 7777");

});