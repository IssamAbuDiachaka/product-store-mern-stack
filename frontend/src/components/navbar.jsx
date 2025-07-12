import { LucideShoppingCart, PlusIcon, ShoppingBasket, SunIcon } from 'lucide-react';
import React from 'react'
import { Link } from 'react-router-dom';
import ThemeSwitcher from '../components/ThemeSwitcher';


function Navbar() {
  return (
    //create a navbar component with lucid icons 
  <div className='flex items-center justify-between p-4 bg-orange-400 text-gray-800 h-14 w-[90%] mx-auto'>

    <div className='flex text-2xl font-semibold font-lato space-x-2 items-center justify-center'>
      <Link to="/" className='flex items-center space-x-2'> 
         <h1 className=''>Product Storage</h1>
         <LucideShoppingCart size={24}className='' />
      </Link>
    </div>

    <div className='flex items-center space-x-4'>
      <Link to="/create-product"> 
        <button className='bg-gray-800 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer'>
         <PlusIcon className='' />
       </button>
      </Link>

      <button className='bg-gray-800 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer '>
        <ThemeSwitcher />
      </button>

    </div>
  </div>
  )
}

export default Navbar;