const socketio = require("socket.io");
const mongoose = require("mongoose");
const driverModel=require('../models/driverListModel')
const createrideModel=require('../models/createRide')
const Setting=require('../models/settingModel')


async function initializeSocket(server) {

  const io = socketio(server, { cors: { origin: ["http://localhost:4200"] } });

  global.io = io;

  io.on("connection", (socket) => {
    console.log("Socket is Running.....................");

    // initializeCronJob();

    

     //------------------- filter driver data (city ,service,status=>true)
     socket.on("showdriverdata", async (data) => {
      // console.log("70",data);

      try {
        const cityId = new mongoose.Types.ObjectId(data.cityId);
        const serviceId = new mongoose.Types.ObjectId(data.serviceId);
        // console.log(data.cityId, serviceId);

        const aggregationPipeline = [
         {
            $lookup: {
              from: "zones",
              localField: "cityId",
              foreignField: "_id",
              as: "city",
            },
          },
          {
            $unwind: "$city",
          },
          {
            $lookup: {
              from: "vehicles",
              localField: "serviceID",
              foreignField: "_id",
              as: "service",
            },
          },
          {
            $unwind: {
              path: "$service",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              cityId: cityId,
              serviceID: serviceId,
              status: true,
              assign: "0",
            },
          },
        ];
        const driverdata = await driverModel
          .aggregate(aggregationPipeline)
          .exec();
        // console.log( "driverdataresponse", driverdata);

        io.emit("availabledriverdata", driverdata, {
          success: true,
          message: "Driver Data Patched in Assign Dialog Box",
          driverdata,
        });
      } catch (error) {
        console.log(error);
        io.emit("availabledriverdata", {
          success: false,
          message: "Driver Data Not Patched in Assign Dialog Box",
          error: error.message,
        });
      }
    });


// ------------------------final assign confirm btn click(in modal)-----------------
    socket.on("AssignedData", async (data) => {
      const driverId = data.driverId;
      const rideId = data.rideId 
      console.log("socket data ...................................:",data);
      try {
        const driver = await driverModel.findByIdAndUpdate(
          driverId,
          { assign: "1" },
          { new: true }
        );

        const updatedRide = await createrideModel.findByIdAndUpdate(
          { _id: rideId },
          {
            $set: { driverId: driverId, ridestatus: 1, assigningTime: Date.now(), nearest: false },
          },
          { new: true }
        );

        const alldata = await createrideModel.aggregate([
          {
            $match: {
              _id: updatedRide._id,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $unwind: {
              path: "$user",
            },
          },
          {
            $lookup: {
              from: "zones",
              localField: "cityId",
              foreignField: "_id",
              as: "city",
            },
          },
          {
            $unwind: {
              path: "$city",
            },
          },
          {
            $lookup: {
              from: "countries",
              localField: "countryId",
              foreignField: "_id",
              as: "country",
            },
          },
          {
            $unwind: {
              path: "$country",
            },
          },
    
          {
            $lookup: {
              from: "vehicles",
              localField: "vehicleId",
              foreignField: "_id",
              as: "service",
            },
          },
          {
            $unwind: {
              path: "$service",
            },
          },
          {
            $lookup: {
              from: "driver_lists",
              localField: "driverId",
              foreignField: "_id",
              as: "driver",
            },
          },
          {
            $unwind: {
              path: "$driver",
              // preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$scheduledDate",
                },
              },
            },
          },
        ]);

        console.log("single assign : ",alldata);

        // AssignedDriverData.push(alldata);
        // console.log(AssignedDriverData);

        io.emit("newdata", {
          success: true,
          message: "Driver Assigned Successfully.",
          alldata,
        });
      } catch (error) {
        console.log(error);
        io.emit("newdata", {
          success: false,
          message: "Sorry Driver Not Assigned",
          error: error.message,
        });
      }
    });


    // --------------------- cancel ride btn(confirm ride)--------------------
     socket.on("cancelride", async (rideId) => {
      console.log(rideId);

      try {
        const ridedata = await createrideModel.findByIdAndUpdate(
         { _id:rideId},
          { ridestatus: 3 },
          { new: true }
        );
        console.log(ridedata);
        io.emit("cancelridedata", {
          success: true,
          message: "Ride Cancelled Successfully",
          ridedata,
        });
      } catch (error) {
        console.error(error);
        io.emit("cancelridedata", {
          success: false,
          message: "Ride Not Cancelled",
          error: error.message,
        });
      }
    });

     // ------------near driver assign--------------------------------------

    socket.on("nearData", async (data) => {
      const rideId =new mongoose.Types.ObjectId(data.rideId);
      const cityId = new mongoose.Types.ObjectId(data.cityId);
      const serviceID = new mongoose.Types.ObjectId(data.serviceId);
      // console.log("body data :", data);
      const driverdata = await driverModel.find({ status: true, cityId: cityId, serviceID:serviceID, assign: "0" });

        // console.log("near all driver : ",driverdata)

        const firstdriver = driverdata[0]
        // console.log("near firstdriver ",firstdriver.username);

        if (firstdriver) {   
          const driver = await driverModel.findByIdAndUpdate(firstdriver._id, { assign: "1" }, { new: true });
          
          // console.log("first driver detail : ",driver)
          
          const ride = await createrideModel.findByIdAndUpdate(rideId, { driverId: firstdriver._id,
            ridestatus: 1,
            nearest: true,
            nearestArray: firstdriver._id,
            assigningTime: Date.now() },
            { new: true })
            
            // console.log("near update ride :",ride )    
          }
          else{
            const ride = await createrideModel.findByIdAndUpdate(rideId, {
              ridestatus: 1,
              nearest: true, },{ new: true })
          }

      try { 

        const alldata = await createrideModel.aggregate([
          {
            $match: {
              _id: rideId,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $unwind: {
              path: "$user",
            },
          },
          {
            $lookup: {
              from: "zones",
              localField: "cityId",
              foreignField: "_id",
              as: "city",
            },
          },
          {
            $unwind: {
              path: "$city",
            },
          },
          {
            $lookup: {
              from: "countries",
              localField: "countryId",
              foreignField: "_id",
              as: "country",
            },
          },
          {
            $unwind: {
              path: "$country",
            },
          },
    
          {
            $lookup: {
              from: "vehicles",
              localField: "vehicleId",
              foreignField: "_id",
              as: "service",
            },
          },
          {
            $unwind: {
              path: "$service",
            },
          },
          {
            $lookup: {
              from: "driver_lists",
              localField: "driverId",
              foreignField: "_id",
              as: "driver",
            },
          },
          {
            $unwind: {
              path: "$driver",
              // preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$scheduledDate",
                },
              },
            },
          },
        ]);

        console.log("near driver assign dara", alldata)

        io.emit("nearResponce", {
          success: true,
          message: "Assign Any Available Driver Success.",
          alldata,
        });
      } catch (error) {
        console.log(error);
        io.emit("nearResponce", {
          success: false,
          message: "Sorry,Not Assign Any Available Driver",
          error: error.message,
        });
      }
    });


////////////////////////runing req part///////////////////////////////////

     socket.on("runningrequest", async () => {
      try {
        const alldata = await createrideModel.aggregate([
          {
            $match: {
              ridestatus: { $in: [1, 4, 5, 6, 7, 8, 9] },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $unwind: {
              path: "$user",
            },
          },
          {
            $lookup: {
              from: "zones",
              localField: "cityId",
              foreignField: "_id",
              as: "city",
            },
          },
          {
            $unwind: {
              path: "$city",
            },
          },
          {
            $lookup: {
              from: "countries",
              localField: "countryId",
              foreignField: "_id",
              as: "country",
            },
          },
          {
            $unwind: {
              path: "$country",
            },
          },
    
          {
            $lookup: {
              from: "vehicles",
              localField: "vehicleId",
              foreignField: "_id",
              as: "service",
            },
          },
          {
            $unwind: {
              path: "$service",
            },
          },
          {
            $lookup: {
              from: "driver_lists",
              localField: "driverId",
              foreignField: "_id",
              as: "driver",
            },
          },
          {
            $unwind: {
              path: "$driver",
              // preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$scheduledDate",
                },
              },
            },
          },
        ]);

        // console.log(alldata);

        io.emit("runningdata", {
          success: true,
          message: "Running-Request Data",
          alldata,
        });
      } catch (error) {
        console.error(error);
        io.emit("runningdata", {
          success: false,
          message: "Error retrieving data",
          error: error.message,
        });
      }
    });


    

    socket.on("disconnect", () => {
      console.log("client Disconnected.....................");
    });
  });




/////////////////////////////////cron/////////////////////////////


// fatch time in the setting

  // async function fetchSettings() {
  //   try {
  //     const settings = await Setting.findOne({});
  //     if (settings) {
  //       return settings;
  //     } 
      
  //   } catch (error) {
  //     console.error('Error fetching settings:', error);
  //     return {
  //       selectedSeconds: 10,
  //     };
  //   }
  // }

  
 
// // ------------------cron part-------------------

// // const TIMEOUT_DURATION = 10000; // Time duration for each driver assignment


//   cron.schedule('* * * * * *', async () => {
//     console.log("Cron job executing...");

//     const settings = await fetchSettings();
//     const TIMEOUT_DURATION = settings.selectedSeconds * 1000;


//     try {
//       console.log('Cron job executed..............................................');
//       // -------------------if direct assign driver
//       const currentTime = new Date();
//       const timeoutTime = new Date(currentTime.getTime() - TIMEOUT_DURATION);
//       // const timeoutTime = new Date(currentTime.getTime());

//       const requests = await createrideModel.aggregate(
//         [{

//           $match: {
//             ridestatus: 1,
//             nearest: false
//           }
//         },
//         ]
//       )
//       // console.log(requests)
//       // console.log(currentTime)
//       // console.log(timeoutTime)
//       if (requests) {

//         for (const request of requests) {

//           let assignTime = new Date(request.assigningTime)
//           console.log(assignTime)

//           if (timeoutTime.getTime() > assignTime.getTime()) {


//             console.log(".....................>>>>>>>>>>>>>>............")
//             var ridenewdata = await createrideModel.findByIdAndUpdate(request._id, { $set: { ridestatus: 0 }, $unset: { driverId: 1 } }, { new: true });

//             var drivernewdata = await driverModel.findByIdAndUpdate(request.driverId, { $set: { assign: 0 } }, { new: true });

//             io.emit("cronUpdateData", {
//               success: true,
//               message: "timeoutdata",
//               ridenewdata,
//               drivernewdata
//             });

//             // console.log(request.driverId)
//           }
//         }

//       }
//     } catch (error) {
//       console.error('Error in cron job:', error);
//     }

//     // --------------------near driver find


//     try {
//       const currentTime = new Date().getTime();
//       const timeoutTime = currentTime - TIMEOUT_DURATION;

//       const nearRequests = await createrideModel.aggregate([
//         {
//           $match: {
//             $and: [
//               { $or: [{ ridestatus: 1 }, { ridestatus: 8 }] },
//               { nearest: true },
//               {
//                 $expr: {
//                   $lt: [
//                     "$assigningTime",
//                     timeoutTime
//                   ]
//                 }
//               }
//             ]
//           }
//         },
//         {
//           $lookup: {
//             from: "driver_lists",
//             let: { cityId: "$cityId", vehicleId: "$vehicleId", priAssigneddrivers: "$nearestArray" },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $and: [
//                       { $eq: ["$status", true] },
//                       { $eq: ["$cityId", "$$cityId"] },
//                       { $eq: ["$serviceID", "$$vehicleId"] },
//                       { $eq: ["$assign", "0"] },
//                       { $not: { $in: ["$_id", "$$priAssigneddrivers"] } }
//                     ]
//                   }
//                 }
//               }
//             ],
//             as: "pendingDrivers"
//           }
//         },

//         // total driver
//         {
//           $lookup: {
//             from: "driver_lists",
//             let: {
//               cityId: "$cityId",
//               vehicleId: "$vehicleId",
//             },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $and: [
//                       { $eq: ["$status", true] },
//                       { $eq: ["$cityId", "$$cityId"] },
//                       { $eq: ["$serviceID", "$$vehicleId"] },
//                     ],
//                   },
//                 },
//               },
//               {
//                 $count: "totalDrivers",
//               },
//             ],
//             as: "totalDriversArray",
//           },
//         },
//         {
//           $unwind: {
//             path: "$totalDriversArray",
//           }
//         },


//         {
//           $addFields: {
//             randomIndex: { $floor: { $multiply: [{ $rand: {} }, { $size: "$pendingDrivers" }] } }
//           }
//         },
//         {
//           $addFields: {
//             randomDriver: { $arrayElemAt: ["$pendingDrivers", "$randomIndex"] }
//           }
//         },
//         {
//           $project: {
//             driverdata: {
//               $cond: {
//                 if: {
//                   $gt: [
//                     { $size: "$pendingDrivers" },
//                     0,
//                   ],
//                 },
//                 then: {
//                   $arrayElemAt: [
//                     "$pendingDrivers",
//                     "$randomIndex",
//                   ],
//                 },
//                 else: null,
//               },
//             },

//             pendingDrivers: "$pendingDrivers",

//             totalDrivers: "$totalDriversArray.totalDrivers",

//             totalNear: { $size: "$nearestArray" },

//             ridestatus: {
//               $cond: {
//                 if: {
//                   $gt: [
//                     { $size: "$pendingDrivers" },
//                     0,
//                   ],
//                 },

//                 then: 1,

//                 else: 2
//               }
//             }

//           },
//         },
//         {
//           $addFields: {
//             driverId: "$driverdata._id"
//           }
//         },
//         {
//           $addFields: {
//             assigningTime: Date.now()
//           }
//         },


//       ]);
//       console.log("--------///////////-----------",)

//       // console.log(nearRequests)

//       console.log("--------///////////-----------",)


//       if (nearRequests) {
//         for (var data of nearRequests) {

//           const lastAssignedDriverId = await createrideModel.aggregate([
//             {
//               $match: {
//                 $and: [
//                   { ridestatus: 1 },
//                   { _id: data._id },
//                   {
//                     $expr: {
//                       $lt: ["$assigningTime", timeoutTime]
//                     }
//                   }
//                 ]
//               }
//             },
//             { $project: { lastDriverId: { $arrayElemAt: ["$nearestArray", -1] } } },

//           ]);


//           if (data.ridestatus == 1) {

//             //------------- Free previous driver 

//             if (lastAssignedDriverId.length > 0) {
//               await driverModel.findByIdAndUpdate(lastAssignedDriverId[0].lastDriverId, { assign: "0" });
//             }

//             //----------------- Assign new driver
//             await driverModel.findByIdAndUpdate(data.driverId, { assign: "1" });

//             // -----------------Update ride

//             await createrideModel.findByIdAndUpdate(data._id, {
//               $addToSet: { nearestArray: data.driverId },
//               assigningTime: data.assigningTime,
//               driverId: data.driverId,
//               ridestatus: 1,
//               assigned: "assigning"
//             }, { new: true });


//             io.emit("cronUpdateData", {
//               success: true,
//               message: "timeoutdata",
//               driverdata: { assign: "0" },
//               driver: { assign: "1" },
//               result: { _id: data._id }
//             });

//           }

//           else {

//             console.log("847--elae part start--")
//             if (data.ridestatus == 2) {

//               if (data.totalDrivers > data.totalNear) {

//                 // ---------------------hold condition
//                 if (lastAssignedDriverId.length > 0) {
//                   await driverModel.findByIdAndUpdate(lastAssignedDriverId[0].lastDriverId, { assign: "0" });
//                   console.log("mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm")
//                   console.log("1025 =>lastAssignedDriverId : ", lastAssignedDriverId)
//                 }

//                 await createrideModel.findByIdAndUpdate(data._id, {
//                   driverId: null,
//                   ridestatus: 8,
//                   assigned: "hold"
//                 }, { new: true });

//                 io.emit("cronUpdateData", {
//                   success: true,
//                   message: "timeoutdata",
//                   result: { _id: data._id }
//                 });


//               } else {

//                 if (lastAssignedDriverId.length > 0) {
//                   await driverModel.findByIdAndUpdate(lastAssignedDriverId[0].lastDriverId, { assign: "0" });
//                 }

//                 await createrideModel.findByIdAndUpdate(data._id, {
//                   nearest: false,
//                   nearestArray: [],
//                   driverId: null,
//                   ridestatus: 0,
//                   assigned: "pending"
//                 }, { new: true });


//               }
//               io.emit("cronUpdateData", {
//                 success: true,
//                 message: "timeoutdata",
//                 result: { _id: data._id }
//               });

//             }

//           }
//         }
//       } else {
//         console.log("....erroe....")
//       }

//     } catch (error) {
//       console.error('Error in cron job:', error);
//     }
//   });

// // ------------------cron part over-------------------

 


}


module.exports = initializeSocket;
