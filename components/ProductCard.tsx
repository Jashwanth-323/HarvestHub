
import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { ShoppingCartIcon } from './icons';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (product.stock < 1) {
        alert("Not enough stock available.");
        return;
    }
    setIsAdding(true);
    addToCart(product, 1);
    setTimeout(() => {
        setIsAdding(false);
    }, 1000);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-xl border border-gray-200">
      <div className="relative">
        <img className="h-56 w-full object-cover" src={product.image} alt={product.name} />
      </div>
      <div className="p-4 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{product.farm}</p>
        <div className="flex items-center justify-between mt-4">
          <p className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}<span className="text-sm font-normal text-gray-500"> / {product.unit}</span></p>
        </div>
        <div className="mt-4">
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || isAdding}
            className={`w-full flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isAdding ? 'bg-yellow-500' : 'bg-green-600 hover:bg-green-700'
            } disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors`}
          >
            {isAdding ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
