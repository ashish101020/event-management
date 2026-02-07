const mongoose = require('mongoose');
require('dotenv').config();

const mongoDB = async () => {
    try {
      await mongoose.connect(`${process.env.MONGO_URL}`);
      console.log('Database connected')
    } catch (error) {
      console.error(error);
    }
};

module.exports = mongoDB;