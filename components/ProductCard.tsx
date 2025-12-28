
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, buyNow, formatPrice, farmersList } = useAppContext();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const farmer = farmersList.find(f => f.id === product.farmerId); // Get farmer from context
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    buyNow(product, 1);
    navigate('/cart');
  };

  return (
    <Link to={`/products/${product.id}`} className="group flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
      <div className="relative overflow-hidden">
        <img src={product.imageUrl} alt={product.name} className={`w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300 ease-in-out ${isOutOfStock ? 'grayscale opacity-70' : ''}`} />
        {isOutOfStock && (
          <div className="absolute top-4 left-4">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-lg">
              {t('dashboard.outOfStock')}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate flex-grow">{product.name}</h3>
        </div>
        {farmer && (
          <Link to={`/farms/${farmer.id}`} className="text-sm text-gray-500 dark:text-gray-400 mt-1 hover:underline">
            {farmer.fullName}
          </Link>
        )}
        <div className="mt-4 mb-3 flex justify-between items-center">
          <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {formatPrice(product.price)}
            <span className="text-sm font-normal text-gray-500"> / {product.unit}</span>
          </p>
          {!isOutOfStock && (
            <p className="text-xs text-gray-500">{product.stock} left</p>
          )}
        </div>
         <div className="mt-auto space-y-2">
            <button 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors duration-300 ${isOutOfStock ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark'}`}>
              {isOutOfStock ? t('dashboard.outOfStock') : 'Add to Cart'}
            </button>
            {!isOutOfStock && (
              <button 
                onClick={handleBuyNow}
                className="w-full bg-secondary text-white font-semibold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-300">
                Buy Now
              </button>
            )}
         </div>
      </div>
    </Link>
  );
};

export default ProductCard;
