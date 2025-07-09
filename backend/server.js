//import the dotenv package to load environment variables
import dotenv from 'dotenv'; 
dotenv.config();

//import express
import express from 'express';
import ProductModel from './models/productmodel.js'; 
import connectDB from './config/db.js'; // Import the connectDB function to connect to MongoDB
import productRouter from './routes/products.routes.js';
await connectDB(); 


// Get the express app instance
const app = express();



app.use(express.json()); // Middleware to parse JSON bodies

app.use('/api/products', productRouter);

//  create a Get request for the root route, this will be the entry point of our backend server and will return a simple message
app.get('/', (req, res) => {
    res.send('Hello from the backend Server!');
});




const PORT = process.env.PORT;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// end of file
// File: backend/server.js    