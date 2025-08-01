import mongoose from 'mongoose';

async function connectDB(url) {
    try {
        await mongoose.connect(url);
        console.log("database connected successfully")
    } catch (error) {
        console.log(error)
    }
}

export default connectDB;