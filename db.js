const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb://localhost:27017/AuthDB', {
            useFindAndModify: false,
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("db Connection has Established");
    } catch (err) {
        console.error(err);
        process.exit(1)
    }
}
module.exports = connectDB;