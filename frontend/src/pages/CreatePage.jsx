import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreatePage() {

  const navigate = useNavigate()

  const [newProduct, setNewProduct] = useState({
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
 

    try {
      // Create fetch method
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
        navigate("/")
      } 
    } catch (error) {
      console.log("Product submission error", error);
    }
  };

  const cancelCreateProduct = () => {
    //clear form
    setNewProduct({
    name: '',
    price: '',
    imageUrl: '',
    stock: '',                  
    description: ''
    });
    navigate("/")
  };

  return (
    <div className='m-0 h-screen w-full'>

      <div className='max-w-xl mx-auto p-4'>
        <h2 className='text-center font-semibold tracking-wide font-lato mt-4 mb-4'>
          Create a new product
        </h2>

        <form 
          className='border border-gray-500/25 rounded p-4' 
          onSubmit={submitProduct}
        >

          <div className='w-full mb-4'>
            <input
              type='text'
              id='name'
              value={newProduct.name}
              onChange={(e) => 
                setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder='Enter product name'
              className='border border-gray-500/25 rounded w-full py-2 px-3 '
              required />
          </div>

          <div className='w-full mb-4'>
            <input
              type='float'
              id='price'
              value={newProduct.price}
              onChange={(e) => 
                setNewProduct({ ...newProduct, price: e.target.value })}
              min={0}
              placeholder='Enter product price'
              className='border border-gray-500/25 rounded w-full py-2 px-3 '
              required />
          </div>

          <div className='w-full mb-4'>
            <input
              type='url'
              id='imageUrl'
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
              min={0}
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
              onChange={(e) => 
                setNewProduct({ ...newProduct, description: e.target.value })}
            ></textarea>
          </div>

          <div className='flex justify-between mt-2'>
            <button
              type='button'
              onClick={cancelCreateProduct}
              className='bg-red-500 text-white p-2 m-2 rounded cursor-pointer hover:bg-red-800 font-bold shadow-lg'>
              Cancel
            </button>
            <button
              type="submit"
              className='bg-green-500 text-white p-2 m-2 rounded cursor-pointer hover:bg-green-800 font-bold shadow-lg'>
              Create Product
            </button>
          </div>

        </form>

      </div>

    </div>
  )
}

export default CreatePage;