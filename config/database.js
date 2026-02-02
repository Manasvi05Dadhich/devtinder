const mongoose= require('mongoose');


const connectDB= async()=>{
    await mongoose.connect('mongodb+srv://manasvidadhich05_db_user:VZDZII7CbE9Oiyeh@devtinder.tgzslom.mongodb.net/');
}

connectDB.then(()=>{
    console.log('database connected successfully')
}
).catch((err)=> {
    console.log('db not connected')
})
