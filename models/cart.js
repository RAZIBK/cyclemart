const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const cartSchema= new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    user:{
        type:String,
        required:true 
    },
        product:[{
            productID:mongoose.Schema.Types.ObjectId,
            quantity:Number,
            productname:String,
            subtotal:Number,
            discount:Number,
            price:Number,
            image:{
                type:String
            }
        }],
        total:{
            type:Number,
            default:0
        },
       modifiedOn:{
            type:Date,
            default:Date.now
        },   
})
const cart=mongoose.model('cart',cartSchema)
module.exports=cart