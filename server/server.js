const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const jwt = require('jsonwebtoken'); 
const User = require('./models/User');
const vehicleRoutes = require('./routes/vehicleRoutes');
const countryRoutes = require('./routes/countryRoutes')
const cityRoutes=require('./routes/cityRoutes')
const vehicle_price_Routes=require('./routes/vehicle_price')
const userRoutes=require('./routes/userRoutes')
const driver_listRoutes=require('./routes/driver-listRoutes')
const settingRoutes=require('./routes/settingRoutes')



const port = 3000;
const app = express();

mongoose.connect('mongodb://127.0.0.1/My_app')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = 'secret_key'; 

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).send('Invalid username');
  }
  if (user.password !== password) {
    return res.status(401).send('Invalid password');
  }
  if (user) {
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '20m' });
    res.json({ token });
  } 
});

function checkAuth(req, res, next) {
  const token = req.headers['authorization']; 
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send('Unauthorized');
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    res.status(401).send('Unauthorized');
  }
}

app.use('/vehicles', checkAuth,vehicleRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/countrys',checkAuth, countryRoutes);
app.use('/city',checkAuth, cityRoutes);
app.use('/vehicle/price',checkAuth, vehicle_price_Routes);
app.use('/users',checkAuth, userRoutes);
app.use('/driverlist',checkAuth, driver_listRoutes);
app.use('/setting',settingRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


// app.get('/logout', (req, res) => {
//   res.send('Logout successful');
// });

// function checkAuth(req, res, next) {
//   const token = req.headers.authorization; 
//   if (token) {
//     jwt.verify(token, JWT_SECRET, (err, decoded) => {
//       if (err) {
//         return res.status(401).send('Unauthorized');
//       } else {
//         req.user = decoded;
//         next();
//       }
//     });
//   } else {
//     res.status(401).send('Unauthorized');
//   }
// }

// // Example protected route
// app.get('/dashboard', checkAuth, (req, res) => {
//   res.send('Welcome to the dashboard');
// });