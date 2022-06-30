const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const productSchema= new Schema({
    productName:String,
    
    Description:String,
    mrp:Number,
    Price:Number,  
    Discount:Number,  
    Color:String,
    Stoke:Number, 
    size:Number,
    // Sub_Category:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:'Sub_category',
    //     require:true
    // },
    Category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'category',
        require:true
    },
    Brand:{type:mongoose.Schema.Types.ObjectId,
        ref:'brand',
        require:true},
    Image:{
        type:Array
    } 

})
const product=mongoose.model('product',productSchema)
module.exports=product