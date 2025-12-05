import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, buyNow, formatPrice, farmersList } = useAppContext();
  const navigate = useNavigate();
  const farmer = farmersList.find(f => f.id === product.farmerId); // Get farmer from context

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    buyNow(product, 1);
    navigate('/cart');
  };

  return (
    <Link to={`/products/${product.id}`} className="group flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="relative overflow-hidden">
        <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300 ease-in-out" />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">{product.name}</h3>
        {farmer && (
          <Link to={`/farms/${farmer.id}`} className="text-sm text-gray-500 dark:text-gray-400 mt-1 hover:underline">
            {farmer.fullName}
          </Link>
        )}
        <div className="mt-4 mb-3">
          <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {formatPrice(product.price)}
          </p>
        </div>
         <div className="mt-auto space-y-2">
            <button 
              onClick={handleAddToCart}
              className="w-full bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors duration-300">
              Add to Cart
            </button>
            <button 
              onClick={handleBuyNow}
              className="w-full bg-secondary text-white font-semibold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-300">
              Buy Now
            </button>
         </div>
      </div>
    </Link>
  );
};

export default ProductCard;