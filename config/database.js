const mongoose= require('mongoose');


const connectDB= async () => {
    try {
        await mongoose.connect('mongodb+srv://manasvidadhich05_db_user:tanu2005@devtinder.tgzslom.mongodb.net/devtinder');
        
        console.log('database connected');

    } catch (err) {
        console.log('error in connecting');
        console.log(err);
        
    }
}
module.exports = connectDB;