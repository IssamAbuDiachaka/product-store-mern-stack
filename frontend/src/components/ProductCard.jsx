import { PenBoxIcon, Trash2Icon } from "lucide-react";
import React, { useState } from "react";

function ProductCard({ key, product, setProductID, setShowModal }) {
    
function handleDeleteProduct(id) {
    setProductID(id);
    setShowModal(true);
}


    return(
        <div key={key} className="border border-red-500/25 bg-gray-900 text-white p-2 m-2 rounded-lg shadow-lg hover:shadow-xl relative">
            <div className="">

                <img 
                src={product?.imagerUrl} 
                alt="" 
                className="w-full h-50 rounded"
                />

                <h4>{product?.name}</h4>
                <p>{product?.price}</p>
                
                <div className="flex space-x-2 mt-2">
                    <PenBoxIcon  className="p-1 bg-green-400  rounded cursor-pointer "/>
                    <Trash2Icon  className="p-1 p-1 bg-red-400 text-black rounded cursor-pointer"
                    onClick={() => {
                        handleDeleteProduct(product?.id)
                    }} 
                    />
                </div>
            </div>
     </div>
    )
}

export default ProductCard;