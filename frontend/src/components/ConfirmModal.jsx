import React from "react";  

function confirmModal({setShowModal, productID}) {
        async function deleteProduct(id) {
        try {
            const response = await fetch (`http://localhost:5000/api/products/${id}`,{
                method: "DELETE", 
                headers: {
                    "Content-Type": "application/json"   
                }
            })
            const data = response.json();
            if (response.ok) {
                console.log("Product deleted successfully");
            } 
            
            return data.products;

        } catch (error) {
            console.error("Error deleting product:", error);
        }   
    }

    return (
        <div className="absolute top-0 left-0 z-50 w-full h-screen bg-black bg-opacity-60 flex items-center justify-center p-4 ">
            <div className="flex items-center justify-center h-full">
                <h2>Are you sure you want to delete this product?</h2>
               <div>
                     <button 
                     onClick={() => setShowModal(false)} 
                     variant='primary' className="bg-blue-500 text-white px-4 py-2 rounded ml-4">
                        Cancel
                    </button>
                    <button 
                    onClick={() => {
                        deleteProduct(productID)
                        setShowModal(false);
                         }
                    } 

                    variant='primary' className="bg-red-500 text-white px-4 py-2 rounded ml-4">
                        Delete
                    </button>
               </div>
             </div>    
        </div>
    )
}

export default confirmModal;