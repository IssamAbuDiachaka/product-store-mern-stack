//import the dotenv package to load environment variables
import dotenv from 'dotenv'; 
dotenv.config();


//import the express package to create an Express application
import express from 'express';

// Get the express application instance
const app = express();

//  create a Get route for the root URL
app.get('/', (req, res) => {
    res.send('Hello from the backend Server!');
});


app.get('/products', (req, res) => {
    res.json({
        message: 'This is the products endpoint',
        products: [
            { id: 1, name: 'Product 1', price: 100 },
            { id: 2, name: 'Product 2', price: 200 }
        ]
    });
});


app.post('/products', (req, res) => {
    // simulate adding a product
    const newProduct = {
        id: 3,
        name: 'Product 3',
        price: 300
    };
   
});


const PORT = process.env.PORT || 5000; // Set the port to the value from the environment variable or default to 5000    


//start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} and we are still developing the backend`);
});