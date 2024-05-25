const Driver = require('../models/driverListModel');
const zones=require('../models/cityModel')
const deleteImage = require('../middleware/deleteImage');
const { default: mongoose } = require('mongoose');

exports.createDriver = async (req, res) => {
  try {

    const { countryId, cityId, username, email, phone } = req.body;
    const profilePic = req.file.filename;
    const imagePath = `../public/uploads/driver_list_profile/${profilePic}`;

    //////////////////////////check duplicate/////////////////
    const existingDriver = await Driver.findOne({ $or: [{ email }, { phone }] });

    if (existingDriver) {
      let errorMessage = '';

      if (existingDriver.email === email) {
        errorMessage = 'Email is already in use. Please choose a different one.';
        deleteImage(imagePath);
      } else if (existingDriver.phone === phone) {
        errorMessage = 'Phone number is already in use. Please choose a different one.';
        deleteImage(imagePath);
      }

      return res.json({ success: false, message: errorMessage });
    }

    const newDriver = new Driver({
      profilePic,
      cityId,
      countryId,
      username,
      email,
      phone
    });

    const addedDriver = await newDriver.save();
    const savedDriver = await Driver.aggregate(
      [
        {
          $match: {
            _id: addedDriver._id
          }
        },
        {
          $lookup: {
            from: "zones",
            localField: "cityId",
            foreignField: "_id",
            as: "city"
          }
        },
        {
          $lookup: {
            from: "countries",
            localField: "countryId",
            foreignField: "_id",
            as: "country"
          }
        },
        {
          $addFields: {
            cityName: { "$arrayElemAt": ["$city.name", 0] },
            countryCode: { "$arrayElemAt": ["$country.country_calling_code", 0] }
          }
        },
        {
          $project: {
            city: 0,
            country: 0
          }
        }
      ]
    )
    console.log(savedDriver[0])
    res.status(201).json({ success: true, message: "Driver Added Successfully", Driver: savedDriver[0] });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// //////////////////////////////////////
exports.getDriver = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  try {
    const Drivers = await Driver.aggregate([
      {
        $lookup: {
          from: "zones",
          localField: "cityId",
          foreignField: "_id",
          as: "city"
        }
      },
      {
        $lookup: {
          from: "countries",
          localField: "countryId",
          foreignField: "_id",
          as: "country"
        }
      },
      {
        $addFields: {
          cityName: { "$arrayElemAt": ["$city.name", 0] },
          countryCode: { "$arrayElemAt": ["$country.country_calling_code", 0] }
        }
      },
      {
        $project: {
          city: 0,
          country: 0
        }
      },
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: limit
      }
    ])

    const totalItems = await Driver.countDocuments();

    res.json({ success: true, Drivers, totalItems });
  } catch (error) {
    console.error('Error getting drivers for pagination:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.getShortDriver = async (req, res) => {
  try {
    const { page = 1, limit = 5, sortBy = 'username', sortOrder = 'asc' } = req.query;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const Drivers = await Driver.aggregate(
      [
        {
          $lookup: {
            from: "zones",
            localField: "cityId",
            foreignField: "_id",
            as: "city"
          }
        },
        {
          $lookup: {
            from: "countries",
            localField: "countryId",
            foreignField: "_id",
            as: "country"
          }
        },
        {
          $addFields: {
            cityName: { "$arrayElemAt": ["$city.name", 0] },
            countryCode: { "$arrayElemAt": ["$country.country_calling_code", 0] }
          }
        },
        {
          $project: {
            city: 0,
            country: 0
          }
        },
        {
          $sort: sortOptions
        },
        {
          $skip: ((parseInt(page - 1)) * parseInt(limit))
        },
        {
          $limit: parseInt(limit)
        }
      ]
    )

    const totalUsers = await Driver.countDocuments();

    res.json({
      success: true,
      Drivers,
      totalPages: Math.ceil(totalUsers / limit),
      totalItems: totalUsers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// /////////////////////////////////delete

exports.deleteDriver = async (req, res) => {
  const id = req.params.id;

  try {
    const deletedUser = await Driver.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const imagePath = `../public/uploads/driver_list_profile/${deletedUser.profilePic}`;
    deleteImage(imagePath);
    res.json({ success: true, message: 'Driver deleted successfully', deletedUser });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
// //////////////////////////update logic
exports.updateDriver = async (req, res) => {

  try {
    const DriverId = req.params.id;
    const { username, email, countryId, cityId, phone } = req.body;
    let updatedFields = {};

    if (username) updatedFields.username = username;
    if (email) updatedFields.email = email;
    if (countryId) updatedFields.countryId = countryId;
    if (cityId) updatedFields.cityId = cityId;
    if (phone) updatedFields.phone = phone;

    if (req.file) {
      updatedFields.profilePic = req.file.filename;
    }


    const existingDriver = await Driver.findOne({
      $or: [

        { email: updatedFields.email },
        { phone: updatedFields.phone }
      ]
    });

    if (existingDriver && existingDriver._id.toString() !== DriverId) {
      let errorMessage = '';
      if (existingDriver.email === updatedFields.email) {
        errorMessage = 'Email is already in use. Please choose a different one.';
      } else if (existingDriver.phone === updatedFields.phone) {
        errorMessage = 'Phone number is already in use. Please choose a different one.';
      }
      return res.json({ success: false, message: errorMessage });
    }

    const oldUser = await Driver.findById(DriverId);

    if (req.file && oldUser.profilePic) {
      const imagePath = `../public/uploads/driver_list_profile/${oldUser.profilePic}`;
      deleteImage(imagePath);
    }

    const updatedDriver = await Driver.findByIdAndUpdate(DriverId, updatedFields, { new: true });

    const Drivers = await Driver.aggregate([
      {
        $match: {
          _id: updatedDriver._id
        }
      },
      {
        $lookup: {
          from: "zones",
          localField: "cityId",
          foreignField: "_id",
          as: "city"
        }
      },
      {
        $lookup: {
          from: "countries",
          localField: "countryId",
          foreignField: "_id",
          as: "country"
        }
      },
      {
        $addFields: {
          cityName: { "$arrayElemAt": ["$city.name", 0] },
          countryCode: { "$arrayElemAt": ["$country.country_calling_code", 0] }
        }
      },
      {
        $project: {
          city: 0,
          country: 0
        }
      }

    ])
    console.log(updatedFields)

    if (!updatedDriver) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Driver updated successfully', Driver: Drivers[0] });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Search users 
exports.searchDriver = async (req, res) => {
  const { query, page, pageSize } = req.query;
  const pageNumber = parseInt(page) || 1;
  const limit = parseInt(pageSize) || 10;

  try {
    const Drivers = await Driver.aggregate([
      {
        $match: {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { phone: { $regex: query, $options: 'i' } }
          ]
        }
      },
      {
        $lookup: {
          from: "zones",
          let: { cityId: "$cityId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$cityId"] }
              }
            }
          ],
          as: "city"
        }
      },
      {
        $lookup: {
          from: "countries",
          let: { countryId: "$countryId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$countryId"] } 
              }
            }
          ],
          as: "country" 
        }
      },
      {
        $addFields: {
          cityName: { $arrayElemAt: ["$city.name", 0] },
          countryCode: { $arrayElemAt: ["$country.country_calling_code", 0] }
        }
      },
      {
        $project: {
          city: 0,
          country: 0
        }
      },
      {
        $skip: (pageNumber - 1) * limit
      },
      {
        $limit: limit
      }
    ]);

    const totalCount = await Driver.countDocuments({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    });
    
console.log(Drivers)
    res.json({ success: true, Drivers, totalCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// add service ------------------it is update using socket in the socket file

exports.addService = async (req, res) => {
  const driverId = req.params.id;
  const serviceId = req.body.serviceId;
  console.log(req.body);
  console.log(serviceId)


  try {
    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    if (serviceId === 'none') {
      driver.serviceID = undefined;
    } else {
      driver.serviceID = serviceId;
    }
    const savedService = await driver.save();

    if (serviceId === 'none') {
      const service = await Driver.aggregate(
        [
          {
            $match: {
              _id: savedService._id
            }
          },
          {
            $addFields: {
              serviceID: "none"
            }
          }
        ]
      )
      // res.json({ success: true, message: 'Service Set Successfull', service: service[0] });
      io.emit("servicedata", {
        success: true,
        message: 'Service Set Successfull',
         service: service[0]
      });
    }
    else {

      const service = await Driver.aggregate(
        [
          {
            $lookup: {
              from: "vehicles",
              localField: "serviceID",
              foreignField: "_id",
              as: "result"
            }
          },
          {
            $unwind: {
              path: "$result",
            }
          },
          {
            $project: {
              _id: 1,
              serviceID: 1,
              sevice: "$result.name"
            }
          },
          {
            $match: {
              _id: savedService._id
            }
          }
        ]
      )
      // res.json({ success: true, message: 'Service Added Successfull', service: service[0] });
      io.emit("servicedata", {
        success: true,
        message: 'Service Added Successfull',
         service: service[0]
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}



// add status------------------it is update using socket in the socket file
exports.addStatus = async (req, res) => {
  const driverId = req.params.id;

  try {
    const toggle = await Driver.findById(driverId);

    if (!toggle) {
      const newToggle = new Driver({ driverId, status: true });
      await newToggle.save();
      // return res.json({ message: 'Status set to true', status: true });
      global.io.emit("statusdata", {
        success: true,
        status: toggle.status,
        message: "Driver Status Updated Successfully.",
      });
    } else {
      toggle.status = !toggle.status;
      await toggle.save();
      const message = toggle.status ? 'Status set to true' : 'Status set to false';
      // return res.json({ message, status: toggle.status });
      global.io.emit("statusdata", {
                  success: true,
                  status: toggle.status,
                  message: "Driver Status Updated Successfully.",
                });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// fatch city by relevent country id
exports.fetchCity = async (req, res) => {
  try {
    const countryId = req.body.countryId;

    const cities = await zones.aggregate([
      {
        $match: {
          country_id: new mongoose.Types.ObjectId(countryId) 
        }
      },
      {
        $project: {
          _id: 1,
          name: 1
        }
      }
    ]);

    res.json({ success: true, message: 'Cities fetched successfully', cities: cities });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};