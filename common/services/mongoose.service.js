const mongoose = require('mongoose');


let count = 0;

const connectWithRetry = () => {
    console.log('MongoDB connection with retry');
    mongoose.connect("mongodb://localhost:27017/database_42069-4")
        .then(() => {
            console.log('MongoDB is connected');
        })
        .catch(err => {
            console.log(`MongoDB connection unsuccessful, retry after 5 seconds. Attempt ${++count}: ${err}`);
            setTimeout(connectWithRetry, 5000);
        });
};

connectWithRetry();

exports.mongoose = mongoose;
