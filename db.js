import mongoose from 'mongoose';

const uri = "mongodb+srv://ramadanmahdysaid:tBfd7W6oKGurN3jj@flepar.7fi1a.mongodb.net/?retryWrites=true&w=majority&appName=flepar";

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
