const mongoose=require('mongoose')

const BookingSchema=new mongoose.Schema({
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Customer',
    },
    driver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Driver'
    },
    vehicle:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Vehicle",
    },
    pickupLocation:{
        type:String,
        required:true
    },
    dropoffLocation:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:['pending','accepted','completed','canceled']
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
},{timestamps:true})

const Booking=mongoose.model('Booking',BookingSchema)

module.exports=Booking