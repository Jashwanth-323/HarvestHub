
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import ProductCard from '../../components/ProductCard';
import { CATEGORIES } from '../../constants';

const ProductsPage: React.FC = () => {
  const { products } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(product =>
      selectedCategory === 'All' || product.category === selectedCategory
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Our Fresh Selection</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
          Browse our collection of farm-fresh fruits, vegetables, and more.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-20 bg-stone-50/90 backdrop-blur-sm p-4 z-30 rounded-lg shadow-sm">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-shrink-0">
          <select
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-700">No Products Found</h2>
            <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
