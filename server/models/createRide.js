const mongoose = require('mongoose');

const Status = {
    PENDING: 0,
    ASSIGNING: 1,
    REJECTED: 2,
    CANCELLED: 3,
    ACCEPTED: 4,
    ARRIVED: 5,
    PICKED: 9,
    STARTED: 6,
    COMPLETED: 7,
    HOLD: 8
  };

const saveRideSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId},
    countryId:{type: mongoose.Schema.Types.ObjectId},
    cityId: {type: mongoose.Schema.Types.ObjectId},
    vehicleId: {type: mongoose.Schema.Types.ObjectId},
    driverId: {type: mongoose.Schema.Types.ObjectId,},
    totalDistanceKm: Number,
    totalDurationMin: Number,
    fromLocation: String,
    toLocation: String,
    stopValue: [String],
    estimeteFare: Number,
    paymentOption: String,
    bookingOption: String,
    scheduledDate: Date, 
    scheduledTimeSeconds: Number,
  
      ridestatus: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        default: 0,
      },
      assigningTime: {
        type: Number
      },
      
      nearest: {
        type: Boolean,
        default: false,
      }, 
      nearestArray: {
        type: Array
      },
      feedback:{
        type:{
          rating:Number,
          feedback:String
        },
        default:null
      }
},
{
  timestamps: true,
},

);

module.exports = mongoose.model('SaveRide', saveRideSchema);


