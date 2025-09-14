/**
 * Enhanced ConfirmModal component with better UX and accessibility
 * Features: Better animations, loading states, and cleaner design
 */

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Dialog, Button, Flex, Text } from '@radix-ui/themes';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger" // danger, warning, info
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="text-red-500" size={24} />,
      confirmButton: { color: 'red' },
      iconBg: 'bg-red-50'
    },
    warning: {
      icon: <AlertTriangle className="text-yellow-500" size={24} />,
      confirmButton: { color: 'yellow' },
      iconBg: 'bg-yellow-50'
    },
    info: {
      icon: <AlertTriangle className="text-blue-500" size={24} />,
      confirmButton: { color: 'blue' },
      iconBg: 'bg-blue-50'
    }
  };

  const currentVariant = variantStyles[variant];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Content maxWidth="400px">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Flex direction="column" gap="4">
                {/* Header */}
                <Flex align="center" gap="3">
                  <div className={`p-2 rounded-full ${currentVariant.iconBg}`}>
                    {currentVariant.icon}
                  </div>
                  <div className="flex-1">
                    <Dialog.Title size="4" weight="bold">
                      {title}
                    </Dialog.Title>
                  </div>
                  <Dialog.Close>
                    <Button variant="ghost" size="1" color="gray">
                      <X size={16} />
                    </Button>
                  </Dialog.Close>
                </Flex>

                {/* Message */}
                <Text size="3" color="gray">
                  {message}
                </Text>

                {/* Actions */}
                <Flex gap="3" justify="end" mt="2">
                  <Dialog.Close>
                    <Button 
                      variant="soft" 
                      color="gray"
                      disabled={isLoading}
                    >
                      {cancelText}
                    </Button>
                  </Dialog.Close>
                  <Button
                    onClick={handleConfirm}
                    loading={isLoading}
                    disabled={isLoading}
                    {...currentVariant.confirmButton}
                  >
                    {isLoading ? 'Processing...' : confirmText}
                  </Button>
                </Flex>
              </Flex>
            </motion.div>
          </Dialog.Content>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};

export default ConfirmModal;
