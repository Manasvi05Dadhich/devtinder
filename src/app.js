const express= require('express');
const connectDB = require('../config/database');
const app= express();
require('../config/database')

app.use(express.json());
connectDB();

app.listen(7777, ()=>{
    'server running on 3000';
})