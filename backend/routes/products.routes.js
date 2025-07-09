import express from "express";

const productRouter = express.Router();
import {
    getAllProducts,
    getProductById, 
    createProduct,
    deleteProduct,
    updateProduct
} from "../controllers/product.controller.js";



productRouter.get("/", getAllProducts);

productRouter.get("/:id", getProductById);

productRouter.post("/", createProduct);

productRouter.put("/:id", updateProduct);

productRouter.delete("/:id", deleteProduct);

export default productRouter;