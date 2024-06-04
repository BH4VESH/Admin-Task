const createrideModel = require('../models/createRide');
const driverModel = require('../models/driverListModel');
const userModel = require('../models/userModel');
const {mongoose } = require('mongoose');
const { chargeCustomer } = require('../service/payment');
const { sms } = require('../service/sms');
const { mail } = require('../service/mail');


// ------------------------reject ride

exports.rejectRide = async (req, res) => {
    const rideId =req.body.rideId
    const driverId = req.body.driverId
    
    
    try {
        const fetchridedata = await createrideModel.findById(rideId);
        // console.log(fetchridedata);

        const nearestfalsedriver = await driverModel.findByIdAndUpdate(
          { _id: driverId },
          { $set: { assign: "0" } },  { new: true }
        );

        let nearestfalseride;
          // console.log(fetchridedata.nearest);

        if (fetchridedata.nearest == false) {
          nearestfalseride = await createrideModel.findByIdAndUpdate( rideId,
            { $unset: { driverId: "", assigningTime: "", nearestArray: "" }, $set: { ridestatus: 2 } },  { new: true }
            );
           global.io.emit('assignrejected', nearestfalseride, nearestfalsedriver)
            // console.log("ffffffffffaaaaaaaaa" , nearestfalseride);
        }else{

          let driverData = await driverModel.aggregate([
            {
              $match: {
                status: true,
                city:  fetchridedata.cityId,
                servicetype: fetchridedata.serviceId,
                assign: "0",
                _id: { $nin: fetchridedata.nearestArray}
              },
            },
          ]);

          if(driverData.length > 0){
          
          const newdriver = await driverModel.findByIdAndUpdate(driverData[0]._id, {$set: { assign: "1" }}, { new: true });
          // console.log("nnnnnnnnnn", newdriver);


          const result = await createrideModel.findByIdAndUpdate(rideId, { $set: { assigningTime: Date.now(), driverId: driverData[0]._id}, $addToSet: { nearestArray: driverData[0]._id } }, { new: true });

          global.io.emit('runningrequestreject',result)

          }else{
            // console.log("hhhhhhhhhhh" , "Else");
              //hold condition
            let assigneddriverdata = await driverModel.aggregate([
              {
                $match: {
                  status: true,
                  city:  fetchridedata.cityId,
                  servicetype: fetchridedata.serviceId,
                  assign: "1",
                  _id: { $nin: fetchridedata.nearestArray}
                },
              },
            ]);

              const result = await createrideModel.findByIdAndUpdate(rideId, {$set: { assigningTime: Date.now(), ridestatus: 8},  $unset: {driverId: ""}}, { new: true });
              global.io.emit('runningrequestreject' ,result)
           
          }

        }
    
      } catch (error) {
        console.error(error);
      }
};


//-------------------------accepted
exports.acceptRide = async (req, res) => {
    const driverId = req.body.driverId
    const rideId = req.body.rideId;
    
    try {
        const ride = await createrideModel.findByIdAndUpdate(rideId, { driverId: driverId, ridestatus: 4 }, { new: true })

        var counter2 = global.counter
        if (counter2 <= 0) {
            counter2 = 0
        } else {
            global.counter--
            counter2 = global.counter
        }

        // ride.counter = counter2;

        await sms('ride accepted')
        global.io.emit('rideupdates', { ride, counter2 });
        res.json({ success: true, ride });

    } catch (error) {
        console.log(error);
    }
};

exports.arriveRide = async (req, res) => {
        const rideId =req.body.rideId
        try {
            const ride = await createrideModel.findByIdAndUpdate(rideId, { ridestatus: 5 }, { new: true })

            var counter2 = global.counter
            global.io.emit('rideupdates', { ride, counter2 });
            res.json({ success: true, ride });
        } catch (error) {
            console.log(error);
        }
};
exports.pickRide = async (req, res) => {
        const rideId =req.body.rideId
    try {
        const ride = await createrideModel.findByIdAndUpdate(rideId, { ridestatus: 9 }, { new: true })
        
        var counter2 = global.counter
        global.io.emit('rideupdates', { ride, counter2 });
        res.json({ success: true, ride });
    } catch (error) {
        console.log(error);
    }
};
exports.startRide = async (req, res) => {
        const rideId =req.body.rideId
    try {
        const ride = await createrideModel.findByIdAndUpdate(rideId, { ridestatus: 6 }, { new: true })
       
        var counter2 = global.counter
        await sms('ride stared')
        global.io.emit('rideupdates', { ride, counter2 });
        res.json({ success: true, ride });
    } catch (error) {
        console.log(error);
    }
};
exports.completeRide = async (req, res) => {
    const rideId =req.body.rideId
    const driverId = req.body.driverId
    
    try {
          const driver = await driverModel.findById(driverId)
          const driverAcc=driver.stripeDriverId
          // const ride = await createrideModel.findByIdAndUpdate(rideId, { $set: { ridestatus: 0 }},{ new: true } );
          const ride = await createrideModel.findByIdAndUpdate(rideId, { $set: { ridestatus: 7 }},{ new: true } );
          const user = await userModel.findById(ride.userId)

          // for the payment
            const { success, message ,clientSecret,auth_redirectUrl,paymentIntentStatus} = await chargeCustomer(user.stripeCustomerId, ride.estimeteFare,driverAcc,ride);
            
            console.log("AAAAAA",success)
            console.log("BBBBBB",message)
            console.log("CCCCCC",driver)
            console.log("DDDDDD",auth_redirectUrl)

        var counter2 = global.counter
        await sms('ride completed')
          global.io.emit("rideupdates" ,{success,ride,driver,counter2,message,auth_redirectUrl});
          res.json({ success: true ,ride,driver,message,counter2,auth_redirectUrl});

        } catch (error) {
          console.log(error);
        }
};

exports.freerideanddriver = async (req, res) => {
    const rideId =req.body.rideId
    const driverId = req.body.driverId
    try {
        const driver = await driverModel.findByIdAndUpdate(driverId, { $set: { assign: "0" } }, {new: true});
            const ride = await createrideModel.findByIdAndUpdate(rideId, { $unset: {driverId: "", assigningTime: ""}}, { new: true })
            var counter2 = global.counter
            global.io.emit('rideupdates', {ride, driver,counter2});
            res.json({ success: true ,ride,driver});
          } catch (error) {
            console.log(error);
          } 
};






