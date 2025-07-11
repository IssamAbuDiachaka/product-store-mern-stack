import { Rocket } from 'lucide-react';
import React, {useEffect, useState} from 'react';
import ProductCard from '../components/ProductCard';
import ConfirmModal from '../components/ConfirmModal';

function Homepage() {

const [products, setProducts] = useState([]);
const [showModal, setShowModal] = useState(false);
const [productId, setProductId] = useState(null);

//function to fetch all products from the server to homepage
async function getAllProducts() {
// use js fetch method to get all products from the server
const response = await fetch("http://localhost:5000/api/products", {
  method: "GET",
  headers: {
    "Content-Type": "application/json"
  },
});


// check if the response is ok, if it is, then convert the response to json and log it to the console
if (response.ok) {
  const data = await response.json();
  setProducts(data.data);
}
else{
  console.error("Failed to fetch products");
  }
}

useEffect(() => {
  getAllProducts();
}, [])



  return (
    <div className='min-h-screen m-0 overflow-auto'>
      <div className=' w-[90%] mx-auto'>
        <h2 className='text-center flex justify-center items-center font-semibold tracking-wide font-lato mt-4 -mb-3' >Current Products
          <Rocket className='' />
        </h2>

        {/** Grid container for products */}
        <div className='grid grid-cols-3 gap-3 py-3'>
          {/** Map through the products and render a ProductCard for each product */}
            
            {products.length > 0 && 
            products.map((products) => (
                <ProductCard
                 key={products._id}
                 product={products}
                 setShowModal={setShowModal}
                 setProductId={setProductId}  
                />
              ))}
         </div>
      </div>
      {showModal && (
         < ConfirmModal setShowModal={setShowModal} productId={productId} 
          /> 
        ) 
      }

    </div>
  )
}

export default Homepage