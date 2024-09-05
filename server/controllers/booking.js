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
    try{
        const {bookingId}=req.params;
        const {status}=req.body;

        if (!['pending', 'accepted', 'completed', 'canceled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value.",
            });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true });

        if (!updatedBooking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        res.status(200).json({
            success: true,
            message:"Booking updated successfully",
            data: updatedBooking,
        });
    }
    catch(err){
        console.error("Error updating booking status: ", err);
        res.status(500).json({
            success: false,
            message: "An error occurred while updating the booking status.",
        });
    }
}

exports.getBookingDetails=async(req,res)=>{
    try{
        const {bookingId}=req.params;

        const booking=await Booking.findById(bookingId)
        .populate('customer', 'name email')
        .populate('driver', 'name')
        .populate('vehicle', 'make model');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        res.status(200).json({
            success: true,
            message:"Booking details retrieved successfully",
            data: booking,
        });
    }
    catch(err){

    }
}