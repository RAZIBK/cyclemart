const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const brandSchema= new Schema({
    BrandName:String,
    Image:String,
})
const brand=mongoose.model('brand',brandSchema)
module.exports=brand