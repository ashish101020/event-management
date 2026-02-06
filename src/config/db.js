const mongoose = require('mongoose');

const mongoDB = async () => {
    try {
      await mongoose.connect(`${process.env.MONGO_URL}`);
      console.log('Database connected')
    } catch (error) {
      console.error(error);
    }
};

module.exports = mongoDB;