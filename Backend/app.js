const express = require('express');
const app= express();
const cors=require('cors');
const dotenv = require('dotenv');
dotenv.config();
const connecttodb=require('./db/db');
const cookieparser = require('cookie-parser');
const userRoutes = require('./routes/user.routes');

const captainRoutes = require('./routes/captain.routes');
const mapRoutes = require('./routes/maps.routes');
connecttodb();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieparser());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/users', userRoutes);

app.use('/captains', captainRoutes);
app.use('/maps', mapRoutes);
module.exports = app;