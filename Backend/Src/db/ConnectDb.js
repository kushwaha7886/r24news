import mongoose from "mongoose";


const ConnectDb = async () => {
    try {
        const ConnectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDb Connected !! DB HOST:${ConnectionInstance.connection.host}`);
    } catch (error) {
        console.log("Mongodb Connection Error", error);
        process.exit(1);
    }
};

export default ConnectDb;

