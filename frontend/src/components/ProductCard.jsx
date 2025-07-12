import { PenBox, Trash2Icon } from "lucide-react";
import {Dialog, Button, Flex, TextField, TextArea} from "@radix-ui/themes";
import { useState } from "react";
import { toast } from "sonner";

function ProductCard({ key, product, setShowModal, setProductId, refreshProducts}) {
    

const [updatedProduct, setUpdatedProduct] = useState(product)

async function updateProductById(id){

    const response = await fetch(`http://localhost:5000/api/products${id}`, {
        method:"PUT",
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            name: updatedProduct.name,
            price:parseFloat(updatedProduct.price),
            stock: Number(updatedProduct.stock),
            imageUrl: updatedProduct.imageUrl,
            description: updatedProduct.description
        })
    });

    if (response.ok){
        const data = await response.json()
        console.log(data)
        console.log("Product Updated Succesfuly")
        refreshProducts();
        toast("Product Updated Succesfuly")
    }
}

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
                       <Dialog.Root>
                        <Dialog.Trigger>
                            <PenBox
                            size={18}
                            className="p-1 bg-blue-400 text-black rounded"
                            />
                        </Dialog.Trigger>

                        <Dialog.Content maxWidth="400px">
                            <Dialog.Title>Edit Product</Dialog.Title>
                            <Flex direction="column" gap="3">
                            <TextField.Root
                                placeholder="Update product name"
                                variant="outline"
                                size={1}
                                value={updatedProduct.name}
                                type="text"
                                onChange={(e) => setUpdatedProduct({... updatedProduct, name:e.target.value})}
                            />

                            <TextField.Root
                                placeholder="Update product price"
                                size={1}
                                type="float"
                                variant="outline"
                                min={0}
                                value={updatedProduct.price}
                                onChange={(e) => setUpdatedProduct({... updatedProduct, price:e.target.value})}
                            />

                            <TextField.Root
                                placeholder="Update product stock"
                                size={1}
                                type="number"
                                variant="outline"
                                min={0}
                                value={updatedProduct.stock}
                                onChange={(e) => setUpdatedProduct({... updatedProduct, stock:e.target.value})}
                            />

                            <TextField.Root
                                placeholder="Update product image URL"
                                size="1"
                                type="url"
                                variant="outline"
                                value={updatedProduct.imageUrl}
                                onChange={(e) => setUpdatedProduct({... updatedProduct, imageUrl:e.target.value})}
                            />

                            <TextArea
                                size="3"
                                placeholder="Update product description…"
                                variant="outline"
                                rows={5}
                                value={updatedProduct.description}
                                type="text"
                                onChange={(e) => setUpdatedProduct({... updatedProduct, description:e.target.value})}
                            />
                            </Flex>

                            <Flex gap="3" mt="4" justify="end">
                            <Dialog.Close>
                                <Button variant="soft" color="gray">
                                Cancel
                                </Button>
                            </Dialog.Close>
                            <Dialog.Close>
                                <Button onClick={() => (updateProductById(product._Id))}>Updat Product</Button>
                            </Dialog.Close>
                            </Flex>
                        </Dialog.Content>
                       </Dialog.Root> 

                          
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