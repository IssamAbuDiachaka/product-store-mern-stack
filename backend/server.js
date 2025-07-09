//import the dotenv package to load environment variables
import dotenv from 'dotenv'; 
dotenv.config();

//import express
import express from 'express';
import ProductModel from './models/productmodel.js'; 
import connectDB from './config/db.js'; // Import the connectDB function to connect to MongoDB
await connectDB(); 


// Get the express app instance
const app = express();



app.use(express.json()); // Middleware to parse JSON bodies



//  create a Get request for the root route, this will be the entry point of our backend server and will return a simple message
app.get('/', (req, res) => {
    res.send('Hello from the backend Server!');
});

// fetch all products from the database endpoint
app.get("/api/products", async (req, res) => {
    try {
         await connectDB(); // Connect to the database

         // Fetch all products from the database
         const products = await ProductModel.find({});

         res.status(200).json(products); // Return the products as a JSON response
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
}); 

// fetch a single product by ID from the database endpoint
app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params; // Extract the product ID from the request parameters

    try {
        await connectDB(); // Connect to the database

        // Fetch a single product by ID from the database
        const product = await ProductModel.findById(id);

        res.status(200).json(product); // Return the product as a JSON response
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
} );



// create a new product in the database endpoint
app.post("/api/products", async (req, res) => {
  //consst newProduct = req.body;
  const { name, price, description, imageUrl, stock } = req.body;

    try {
        await connectDB(); 

        // validate product data
        if (!name || !price || !description || !imageUrl || stock === undefined) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create a new product object in the database
        const product = new ProductModel({
            name,
            price,
            description,
            imageUrl,
            stock,
        });

        // Save the new product to the database
        await product.save();

        res.status(201).json({
          message: 'Product created successfully',
          product, 
        })
    } catch (error) { 
      res.status(500).json({ message: 'Error creating product', error: error.message });
    }
}); 

//update a product by ID endpoint
app.put("/api/products/:id", async (req, res) => {
    const { id } = req.params;

    // destructure the product data from the request body
    const { name, price, description, imageUrl, stock } = req.body;

    try {
        await connectDB();

        // Validate product data
        if (!name || !price || !description || !imageUrl || stock === undefined) {
            return res.status(400).json({ message: 'All fields are required' });
        }

       // Find the product by ID and update it
        const updatedProduct = await ProductModel.findByIdAndUpdate(
        id,
        { name, price, description, imageUrl, stock },
        { new: true } // Return the updated document
        );
    
        if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
        }
    
        res.status(200).json({
        message: "Product updated successfully",
        product: updatedProduct
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error: error.message });
    }
});

// Delete a product by ID endpoint
app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await connectDB(); // Connect to the database

    // Find the product by ID and delete it
    const deletedProduct = await ProductModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      product: deletedProduct
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
});



const PORT = process.env.PORT;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// end of file
// File: backend/server.js    