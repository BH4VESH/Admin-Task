const User = require('../models/userModel');
const Zone =require('../models/cityModel')
const {mongoose } = require('mongoose');
const SaveRideModel = require('../models/createRide');
const dotenv=require('dotenv').config();
const stripe = require('stripe')(process.env.stripeSecretKey);
const turf = require('@turf/turf');

exports.searchUsers = async (req, res) => {
    const { countryId, phone } = req.body;
    try {
        const users = await User.aggregate([
            {
                $match: {
                    $and: [
                        { countryId: new mongoose.Types.ObjectId(countryId) },
                        { phone: { $regex: phone, $options: 'i' } }
                    ]
                }
            },
            {
                $lookup: {
                  from: "zones",
                  localField: "countryId",
                  foreignField: "country_id",
                  as: "city",
                },
              },
              {
                $unwind: {
                  path: "$city",
                  preserveNullAndEmptyArrays: true
                },
              },
        ]);
            
              const customer = await stripe.customers.retrieve(users[0].stripeCustomerId);
              const cards = await stripe.customers.listSources(users[0].stripeCustomerId, { object: 'card' });
              const defaultCardId = customer.default_source;
            
        if (users.length > 0) {
            console.log(cards.data)
            res.json({ success: true, users, message: 'Users found success' ,users,cards: cards.data, defaultCardId: defaultCardId});
        } else {
            res.json({ success: false, message: 'No users found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// get vehicle price by specific selected city
exports.getVehiclePrice=async (req,res)=>{
    try{
        const { zoneCityId }=req.body;
        const vehicleData=await Zone.aggregate(
            [
                {
                  $match: {
                    _id: new mongoose.Types.ObjectId(zoneCityId)
                  }
                },
                {
                  $lookup: {
                    from: "vehicle_prices",
                    let: { cityId: "$_id" },
                    pipeline: [
                      {
                        $match: {
                          $expr: { $eq: ["$cityId", "$$cityId"] }
                        },
              
                      },
                      
                    ],
                    as: "vehicle_price"
                  },
                  
                },
                  {
                    $unwind: {
                      path: "$vehicle_price",
                  
                    }
                  },
                        // add vehicele
                {
                  $lookup: {
                    from: "vehicles",
                       let: { cityId: "$vehicle_price.vehicleId" },
                    pipeline:[
                      {
                        $match:{
                          $expr:{$eq:["$_id","$$cityId"]}
                        }
                      }
                    ],
                      
                    as: "vehicle"
                  }
                },
                {
                  $unwind: {
                    path: "$vehicle",
                  }
                }          
                
              ]     
        )
        // console.log(vehicleData)
        res.json({ success: true, message: 'Vehicle Price found success',vehicleData});
    }catch{

    }  
}

// saveRide
exports.saveRide = async (req, res) => {
    try {
        const rideData = req.body;
        const ride = new SaveRideModel(rideData);
        await ride.save();
        res.json({ success: true, message: 'Ride saved successfully', ride });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
};

// --------------------check from point inside polygone or not
// exports.checkPoint = async (req, res) => {
//   const point = {
//     type: 'Point',
//     coordinates: [22.2904,70.7915]
//   };

//   try {
//     // Retrieve polygons
//     const polygons = await Zone.aggregate([
//       {
//         $match: {
//           country_id: new mongoose.Types.ObjectId('660ce2e0167471f8dd0c0e4d')
//         }
//       },
//       {
//         $project: {
//           coordinates: 1
//         }
//       }
//     ]);

//     let isInsideAnyPolygon = false;

//     // Iterate over each polygon
//     for (const polygon of polygons) {
//       const coordinates = polygon.coordinates.map(coord => [coord.lng, coord.lat]);

//       // Close the ring by adding the first coordinate at the end
//       coordinates.push(coordinates[0]);

//       // Construct GeoJSON Polygon
//       const geoJSONPolygon = {
//         type: 'Polygon',
//         coordinates: [coordinates]
//       };
//       console.log('cheking...');

//       // Perform geospatial query to check if the point is inside the polygon
//       if (isPointInsidePolygon(point, coordinates)) {
//         isInsideAnyPolygon = true;
//         res.json('Point is inside a polygon')
//         console.log('Point is inside a polygon');
//         break; // Exit loop if point is inside any polygon
//       }
//     }

//     if (!isInsideAnyPolygon) {
//       res.json('Point is outside all polygons')
//       console.log('Point is outside all polygons');
//     }

//   } catch (error) {
//     console.error('Error:', error);
//   }
// };

// // Function to check if a point is inside a polygon
// function isPointInsidePolygon(point, polygonCoordinates) {
//   const polygon = turf.polygon([polygonCoordinates]);
//   const pointFeature = turf.point(point.coordinates);
//   return turf.booleanPointInPolygon(pointFeature, polygon);
// }

