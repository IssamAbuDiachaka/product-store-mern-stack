import { Button } from "@radix-ui/themes";
import React from "react";

function ConfirmModal({ setShowModal, productId, refreshProducts }) {
  async function deleteProduct(id) {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = response.json();

      if (response.ok) {
        console.log("Product Deleted Successfully!");
        //getAllProducts();
        setShowModal(false);
        refreshProducts();
       // onDelete(id);
      }
      return data.product;
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="absolute w-full h-screen bg-black/60 top-0 left-0 z-50 flex justify-center items-center">
      <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-500/25 p-4 rounded">
        <h2 className="text-white">Confirm Product Deletion</h2>

        <div className="flex justify-between mt-4">
          <Button className="cursor-pointer"
            onClick={() => setShowModal(false)} variant="solid" >
            Cancel
          </Button>
          <Button className="cursor-pointer"
            onClick={() => {
              deleteProduct(productId);
              setShowModal(false);
            }}
            variant="solid"
            color="red" 
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;