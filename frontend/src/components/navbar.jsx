import { LucideShoppingCart, PlusIcon, ShoppingBasket, SunIcon } from 'lucide-react';
import React from 'react'


function Navbar() {
  return (
    //create a navbar component with lucid icons 
  <div className='flex items-center justify-between p-4 bg-orange-400 text-gray-800 h-14 w-[90%] mx-auto'>
    <div className='text-2xl font-semibold tracking-wide font-lato flex space-x-2 items-center '>
      <h1 className=''>Product Storage
        
      </h1>
      <LucideShoppingCart size={24}className='' />
    </div>

    <div className='flex items-center space-x-4'> 
      <button className='bg-gray-800 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer'>
        <PlusIcon className='' />
      </button>

      <button className='bg-gray-800 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer '>
        <SunIcon className='' />
      </button>
    </div>
  </div>
  )
}

export default Navbar;