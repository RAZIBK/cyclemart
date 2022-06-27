const { type } = require('express/lib/response');
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const UserSchema= new Schema({
    // _id:{type:String},
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phonenumber:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    block:{
        type:Boolean,
    },
    address:[{
        fname:String,
        lname:String,
        house:String,
        towncity:String, 
        district:String,
        state:String,
        pincode:Number, 
        email:String,
        mobile:String,
        locality:String,
    }],









    // name:String,
    // address:String,
    // phonenumber:String,
    // email:String,
    // password:String
})
const user=mongoose.model('user',UserSchema)
module.exports=user