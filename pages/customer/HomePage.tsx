
import React from 'react';
import { useData } from '../../contexts/DataContext';
import { CATEGORIES } from '../../constants';
import ProductCard from '../../components/ProductCard';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { products } = useData();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="bg-[#FAF9F7]">
      {/* Banner Section */}
      <div className="relative bg-gray-800">
          <div className="absolute inset-0">
              <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1518843875459-f738682238a6?q=80&w=2071" alt="Fresh vegetables in a basket" />
              <div className="absolute inset-0 bg-green-900 bg-opacity-50"></div>
          </div>
          <div className="relative max-w-4xl mx-auto px-4 py-32 sm:px-6 sm:py-40 lg:px-8 text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Fresh Produce From Local Farmers
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-green-100">
                  Discover the taste of real, locally-grown produce. Support local farmers and enjoy unparalleled freshness with every bite.
              </p>
              <div className="mt-8">
                  <button
                      onClick={() => onNavigate('products')}
                      className="inline-block bg-green-600 border border-transparent rounded-md py-3 px-8 text-base font-medium text-white hover:bg-green-700 transition-transform transform hover:scale-105 shadow-lg"
                  >
                      Shop Now
                  </button>
              </div>
          </div>
      </div>

      {/* Categories Section */}
      <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 text-center mb-12">Shop by Category</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map(category => (
              <div key={category.id} onClick={() => onNavigate('products')} className="bg-lime-50 rounded-xl overflow-hidden group cursor-pointer text-center p-6 flex flex-col items-center hover:shadow-lg transition-shadow">
                <img src={category.image} alt={category.name} className="w-48 h-48 object-contain transform group-hover:scale-105 transition-transform duration-500" />
                <h3 className="mt-4 text-xl font-semibold text-gray-800">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Featured Products Section */}
      <div className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 text-center">Featured Products</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
