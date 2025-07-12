import { PenBoxIcon, Trash2Icon } from "lucide-react";

function ProductCard({ key, product, setShowModal, setProductId }) {
    
function handleDeleteProduct(id) {
    setShowModal(true);
    setProductId(id);
}


    return(
        <div 
        key={key} 
        className="border border-red-500/25 bg-gray-900 text-white p-2 m-2 rounded-lg shadow-lg hover:shadow-xl relative">

            <div>

                <img 
                src={product?.imageUrl} 
                alt={product?.name}
                className="overflow-hidden w-full h-50 rounded h-18"
                />
                <div className="p-1">
                    <h4>{product?.name}</h4>
                    <p>${product?.price}</p>
                    <p className="line-clamp-3">{product?.description}</p>
                
                    <div className="flex space-x-2 mt-2">
                        <PenBoxIcon
                            className="p-1 bg-green-400  rounded cursor-pointer "/>

                        <Trash2Icon  
                        className="p-1 p-1 bg-red-400 text-black rounded cursor-pointer"

                        onClick={() => handleDeleteProduct(product?._id)} 
                    />
                    </div>
                </div>
            </div>
     </div>
    );
}

export default ProductCard;