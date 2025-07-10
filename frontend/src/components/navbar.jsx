import { PlusIcon, SunIcon } from 'lucide-react';
import React from 'react'


function Navbar() {
  return (
    //create a navbar component with lucid icons 
  <div className='flex items-center justify-between p-4 bg-orange-400 text-gray-800 h-14 w-70%'>
    <div className='text-2xl font-semibold tracking-wide font-lato'>Product Storage</div>

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