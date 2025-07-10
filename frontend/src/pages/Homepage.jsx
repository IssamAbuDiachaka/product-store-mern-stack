import { Rocket, SofaIcon } from 'lucide-react'
import React, {useEffect} from 'react'
import ProductCard from '../components/ProductCard'


function Homepage() {
const [products, setProducts] = React.useState([]);
console.log(products);

//function to fetch all products from the server to homepage
async function getAllProducts() {
// use js fetch method to get all products from the server
const response = await fetch("http://localhost:5000/api/products", {
  method: "GET",
  headers: {
    "Content-Type": "application/json"
  },
})


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
    <div className='min-h-screen m-0'>
      <div className=' w-[90%] mx-auto'>
        <h2 className='text-center flex justify-center items-center font-semibold tracking-wide font-lato' >Current Products
          <Rocket className='size={18}' />
        </h2>

        {/** Grid for products */}
        <div className='border-green-500 grid grid-cols-3 gap-3'>
          {/** Map through the products and render a ProductCard for each product */}
            
            {products.length > 0 && products.map
            ((products) => (
                <ProductCard
                 key={products._id}
                  product={products}

                />
              ))}
         </div>
      </div>
    </div>
  )
}

export default Homepage