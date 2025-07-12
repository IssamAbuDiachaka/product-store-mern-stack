import React from 'react'
import { Button } from "@radix-ui/themes";
import { Routes } from 'react-router-dom';
import { Route } from 'react-router-dom';
import CreatePage from './pages/CreatePage.jsx';
import Homepage from './pages/Homepage.jsx';
import Navbar from './components/navbar.jsx';
import { Toaster } from 'sonner';


function App() {
 

  return (
    <>
     {/* first => We need navbar component, static accross all pages */}
    <Toaster />
    <Navbar />

    <Routes>
      {/* second => We need to define the routes */}
      <Route path='/' element={<Homepage />} />
      <Route path='/create-product' element={<CreatePage />} />
    </Routes>

    </>

  )
}

export default App
