import React from 'react'
import { Navigate, useNavigate } from 'react-router-dom';

function CreatePage() {
  // State to hold the new product data
  const [newProduct, setNewProduct] = React.useState({
    name: '',
    price: '',
    imageUrl: '',
    stock: '',                  
    description: ''
  });

  const submitProduct = async (e) => {
    e.preventDefault();
    const serializedData = {
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      imageUrl: newProduct.imageUrl,
      stock: Number(newProduct.stock),
      description: newProduct.description
    };
    console.log("TestinConversion", serializedData);

    try {
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(serializedData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Product Created", data.product)
        Navigate("/")
      } else {
        console.error("failed to create")
      }
    } catch (error) {
      console.log("Product submission error", error);
    }
  };

  return (
    <div className='m-0 h-screen overflow-auto w-full'>

      <div className='max-w-xl mx-auto p-4'>
        <h2 className='text-center flex justify-center items-center font-semibold tracking-wide font-lato mt-4 mb-4'>
          Create a new product
        </h2>

        <form className='border border-gray-500/25 rounded p-4' onSubmit={submitProduct}>

          <div className='w-full mb-4'>
            <input
              type='text'
              id='name'
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder='Enter product name'
              className='border border-gray-500/25 rounded w-full py-2 px-3 '
              required />
          </div>

          <div className='w-full mb-4'>
            <input
              type='float'
              id='price'
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              min={0}
              defaultValue={0}
              placeholder='Enter product price'
              className='border border-gray-500/25 rounded w-full py-2 px-3 '
              required />
          </div>

          <div className='w-full mb-4'>
            <input
              type='url'
              id='image'
              value={newProduct.imageUrl}
              onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
              placeholder='Enter product image url'
              className='border border-gray-500/25 rounded w-full py-2 px-3 '
              required />
          </div>

          <div className='w-full mb-4'>
            <input
              type='number'
              id='stock'
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              placeholder='Enter product stock'
              className='border border-gray-500/25 rounded w-full py-2 px-3 '
              required />
          </div>

          <div>
            <textarea
              className="w-full border border-gray-500/25 rounded outline-none py-2 px-3 mb-2"
              rows={4}
              placeholder='Enter product description'
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            ></textarea>
          </div>

          <div className='flex justify-between'>
            <button
              type='button'
              className='bg-red-400 text-white p-2 mt-4 rounded cursor-pointer hover:bg-red-800 font-bold shadow-lg'>
              Cancel
            </button>
            <button
              type="submit"
              className='bg-green-500 text-white p-2 mt-4 rounded cursor-pointer hover:bg-green-800 font-bold shadow-lg'>
              Create Product
            </button>
          </div>

        </form>

      </div>

    </div>
  )
}

export default CreatePage