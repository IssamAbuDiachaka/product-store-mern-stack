import { useState } from "react";
import { PenBox, Trash2, Eye, ShoppingCart } from "lucide-react";
import { Dialog, Button, Flex, TextField, TextArea, Card } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { formatPrice, truncateText, validateProduct } from "../utils/helpers.js";
import { toast } from "sonner";

const ProductCard = ({ product, onUpdate, onDelete, onView }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatedProduct, setUpdatedProduct] = useState(product);
  const [errors, setErrors] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Handle product update
  const handleUpdate = async () => {
    const validation = validateProduct(updatedProduct);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsUpdating(true);

    try {
      await onUpdate(product._id, {
        name: updatedProduct.name,
        price: parseFloat(updatedProduct.price),
        stock: parseInt(updatedProduct.stock),
        imageUrl: updatedProduct.imageUrl,
        description: updatedProduct.description,
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to update product:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setUpdatedProduct(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle delete confirmation
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      onDelete(product._id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
        {/* Product Image */}
        <div className="relative overflow-hidden aspect-square">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          
          {/* Stock Badge */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              product.stock > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button
                size="2"
                variant="solid"
                className="bg-white/90 text-gray-900 hover:bg-white"
                onClick={() => onView && onView(product)}
              >
                <Eye size={16} />
              </Button>
              <Button
                size="2"
                variant="solid"
                color="blue"
                disabled={product.stock === 0}
              >
                <ShoppingCart size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1" title={product.name}>
              {product.name}
            </h3>
            <p className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </p>
          </div>

          <p className="text-sm text-gray-600 line-clamp-3">
            {truncateText(product.description, 100)}
          </p>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-2">
              <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <Dialog.Trigger asChild>
                  <Button size="2" variant="soft" color="blue">
                    <PenBox size={16} />
                    Edit
                  </Button>
                </Dialog.Trigger>

                <Dialog.Content maxWidth="500px">
                  <Dialog.Title>Edit Product</Dialog.Title>
                  <Dialog.Description size="2" mb="4">
                    Make changes to your product information.
                  </Dialog.Description>

                  <Flex direction="column" gap="4">
                    {/* Product Name */}
                    <div>
                      <TextField.Root
                        placeholder="Product name"
                        value={updatedProduct.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        color={errors.name ? 'red' : undefined}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                      )}
                    </div>

                    {/* Price and Stock */}
                    <Flex gap="3">
                      <div className="flex-1">
                        <TextField.Root
                          placeholder="Price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={updatedProduct.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          color={errors.price ? 'red' : undefined}
                        />
                        {errors.price && (
                          <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                        )}
                      </div>
                      <div className="flex-1">
                        <TextField.Root
                          placeholder="Stock"
                          type="number"
                          min="0"
                          value={updatedProduct.stock}
                          onChange={(e) => handleInputChange('stock', e.target.value)}
                          color={errors.stock ? 'red' : undefined}
                        />
                        {errors.stock && (
                          <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
                        )}
                      </div>
                    </Flex>

                    {/* Image URL */}
                    <div>
                      <TextField.Root
                        placeholder="Image URL"
                        type="url"
                        value={updatedProduct.imageUrl}
                        onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                        color={errors.imageUrl ? 'red' : undefined}
                      />
                      {errors.imageUrl && (
                        <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <TextArea
                        placeholder="Product description..."
                        rows={4}
                        value={updatedProduct.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        color={errors.description ? 'red' : undefined}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                      )}
                    </div>
                  </Flex>

                  <Flex gap="3" mt="6" justify="end">
                    <Dialog.Close>
                      <Button variant="soft" color="gray">
                        Cancel
                      </Button>
                    </Dialog.Close>
                    <Button 
                      onClick={handleUpdate} 
                      loading={isUpdating}
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Updating...' : 'Update Product'}
                    </Button>
                  </Flex>
                </Dialog.Content>
              </Dialog.Root>

              <Button
                size="2"
                variant="soft"
                color="red"
                onClick={handleDelete}
              >
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
