const Booking=require('../models/bookingSchema')
const Driver=require('../models/driverSchema')
const Vehicle=require('../models/vehicleSchema')

exports.createBooking=async(req,res)=>{
    try{
        const {customerId,driverId,vehicleId,pickupLocation,dropoffLocation,fare,distance,duration}=req.body;

        const driver=Driver.findById(driverId)
        const vehicle = await Vehicle.findById(vehicleId);

        if (!driver || !vehicle) {
            return res.status(404).json({
                success: false,
                message: "Driver or Vehicle not found.",
            });
        }

        const newBooking=await Booking.create({
            customer:customerId,
            driver:driverId,
            vehicle:vehicleId,
            pickupLocation,
            dropoffLocation,
            fare,
            distance,
            duration
        },{new:true})

        res.status(201).json({
            success: true,
            message:"Booking created successfully",
            data: newBooking,
        });
    }
    catch(err){
        console.error("Error creating booking: ", err);
        res.status(500).json({
            success: false,
            message: "An error occurred while creating the booking.",
        });
    }
}

exports.updateBookingStatus=async(req,res)=>{
    
}