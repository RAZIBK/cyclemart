const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const adminSchema= new Schema({
    name:String,
    // address:String,
    phonenumber:String,
    email:String,
    password:String
    
})
const admin=mongoose.model('admin',adminSchema)
module.exports=admin