const express = require('express');
const cors = require('cors');
const mongoDB = require('./config/db');
require('dotenv').config();
const authRoute = require('./routes/auth.route');
const eventRoute = require('./routes/event.route');
const userRoute = require('./routes/user.route');
const adminRoute = require('./routes/admin.route');
const registrationRoute = require('./routes/registration.route');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoDB();

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('/api/auth', authRoute);
app.use('/api/events', eventRoute);
app.use('/api/registration', registrationRoute);
app.use('/api/users', userRoute);
app.use('/api/admin', adminRoute);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});