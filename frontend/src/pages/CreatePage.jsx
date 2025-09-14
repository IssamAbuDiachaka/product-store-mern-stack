/**
 * Enhanced CreatePage with improved form validation, user experience, and state management
 * Features: Real-time validation, image preview, better error handling, loading states
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Eye, Save, X } from 'lucide-react';
import { Button, TextField, TextArea, Card, Badge, Flex } from '@radix-ui/themes';
import { motion } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';
import { validateProduct, formatPrice } from '../utils/helpers';

const CreatePage = () => {
  const navigate = useNavigate();
  const { createProduct } = useProducts(false);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    imageUrl: '',
    stock: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Handle input changes with real-time validation
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Real-time validation for specific fields
    if (field === 'price' && value) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        setErrors(prev => ({ ...prev, price: 'Price must be a positive number' }));
      }
    }

    if (field === 'stock' && value !== '') {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 0) {
        setErrors(prev => ({ ...prev, stock: 'Stock must be a non-negative number' }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateProduct(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await createProduct({
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl.trim(),
        stock: parseInt(formData.stock),
        description: formData.description.trim(),
      });
      
      // Navigate back to homepage after successful creation
      navigate('/');
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to create product' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      name: '',
      price: '',
      imageUrl: '',
      stock: '',
      description: '',
    });
    setErrors({});
    setShowPreview(false);
  };

  // Cancel and go back
  const handleCancel = () => {
    if (Object.values(formData).some(value => value.trim())) {
      if (window.confirm('Are you sure you want to discard your changes?')) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="2"
            onClick={handleCancel}
            className="mb-4"
          >
            <ArrowLeft size={16} />
            Back to Products
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
              <p className="text-gray-600 mt-1">
                Add a new product to your store inventory
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                disabled={!formData.name || !formData.imageUrl}
              >
                <Eye size={16} />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <TextField.Root
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    color={errors.name ? 'red' : undefined}
                    size="3"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Price and Stock Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price * {formData.price && <span className="text-green-600">({formatPrice(formData.price)})</span>}
                    </label>
                    <TextField.Root
                      placeholder="0.00"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      color={errors.price ? 'red' : undefined}
                      size="3"
                    >
                      <TextField.Slot>$</TextField.Slot>
                    </TextField.Root>
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <TextField.Root
                      placeholder="0"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => handleInputChange('stock', e.target.value)}
                      color={errors.stock ? 'red' : undefined}
                      size="3"
                    />
                    {errors.stock && (
                      <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                    )}
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL *
                  </label>
                  <TextField.Root
                    placeholder="https://example.com/image.jpg"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    color={errors.imageUrl ? 'red' : undefined}
                    size="3"
                  >
                    <TextField.Slot>
                      <Upload size={16} />
                    </TextField.Slot>
                  </TextField.Root>
                  {errors.imageUrl && (
                    <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Enter a valid image URL for your product
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                    <span className="text-gray-400 ml-2">
                      ({formData.description.length}/500)
                    </span>
                  </label>
                  <TextArea
                    placeholder="Enter product description..."
                    rows={4}
                    maxLength={500}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    color={errors.description ? 'red' : undefined}
                    size="3"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{errors.submit}</p>
                  </div>
                )}

                {/* Form Actions */}
                <Flex gap="3" justify="between">
                  <Button
                    type="button"
                    variant="outline"
                    color="gray"
                    onClick={handleReset}
                    disabled={isSubmitting}
                  >
                    <X size={16} />
                    Reset Form
                  </Button>
                  
                  <Flex gap="2">
                    <Button
                      type="button"
                      variant="soft"
                      color="gray"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      size="3"
                    >
                      <Save size={16} />
                      {isSubmitting ? 'Creating...' : 'Create Product'}
                    </Button>
                  </Flex>
                </Flex>
              </form>
            </Card>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={showPreview ? 'block' : 'hidden lg:block'}
          >
            <div className="sticky top-8">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Product Preview
                </h3>
                
                {formData.name || formData.imageUrl ? (
                  <div className="space-y-4">
                    {/* Preview Image */}
                    {formData.imageUrl && (
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={formData.imageUrl}
                          alt={formData.name || 'Product preview'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkgMTJMMTEgMTRMMTUgMTBNMjEgMTJDMjEgMTYuOTcwNiAxNi45NzA2IDIxIDEyIDIxQzcuMDI5NDQgMjEgMyAxNi45NzA2IDMgMTJDMyA3LjAyOTQ0IDcuMDI5NDQgMyAxMiAzQzE2Ljk3MDYgMyAyMSA3LjAyOTQ0IDIxIDEyWiIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
                          }}
                        />
                      </div>
                    )}

                    {/* Preview Details */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg">
                        {formData.name || 'Product Name'}
                      </h4>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-600">
                          {formData.price ? formatPrice(formData.price) : '$0.00'}
                        </span>
                        {formData.stock && (
                          <Badge 
                            color={parseInt(formData.stock) > 0 ? 'green' : 'red'}
                            variant="soft"
                          >
                            {parseInt(formData.stock) > 0 
                              ? `${formData.stock} in stock` 
                              : 'Out of stock'
                            }
                          </Badge>
                        )}
                      </div>

                      {formData.description && (
                        <p className="text-gray-600 text-sm">
                          {formData.description}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Upload size={48} className="mx-auto mb-4" />
                    <p>Fill in the form to see preview</p>
                  </div>
                )}
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
