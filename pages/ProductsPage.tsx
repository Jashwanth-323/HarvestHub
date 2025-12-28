
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { categories } from '../data'; // Import farmers
import ProductCard from '../components/ProductCard';
import { ChevronDownIcon } from '../components/icons';
import { useLanguage } from '../context/LanguageContext';
import { useAppContext } from '../context/AppContext'; // Import useAppContext

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  // Use products and farmersList from AppContext
  const { products, farmersList } = useAppContext(); 
  const categoryFromUrl = searchParams.get('category');
  const farmerFromUrl = searchParams.get('farmer'); // New: Get farmer from URL
  const view = searchParams.get('view');

  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'All');
  const [selectedFarmer, setSelectedFarmer] = useState(farmerFromUrl || 'All'); // New: State for selected farmer
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  
  useEffect(() => {
    setSelectedCategory(categoryFromUrl || 'All');
  }, [categoryFromUrl]);

  useEffect(() => {
    setSelectedFarmer(farmerFromUrl || 'All'); // New: Update selectedFarmer from URL
  }, [farmerFromUrl]);


  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products; // Use products from context

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // New: Filter by farmer
    if (selectedFarmer !== 'All') {
      filtered = filtered.filter(p => p.farmerId === selectedFarmer);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (organicOnly) {
      filtered = filtered.filter(p => p.isOrganic === true);
    }

    if (inStockOnly) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [selectedCategory, selectedFarmer, searchTerm, sortBy, products, organicOnly, inStockOnly]); // Add selectedFarmer to dependency array

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const newSearchParams = new URLSearchParams(searchParams);
    if (category === 'All') {
        newSearchParams.delete('category');
    } else {
        newSearchParams.set('category', category);
    }
    // Remove view=all if a category is selected
    newSearchParams.delete('view');
    setSearchParams(newSearchParams);
  }

  // New: Handle farmer filter change
  const handleFarmerChange = (farmerId: string) => {
    setSelectedFarmer(farmerId);
    const newSearchParams = new URLSearchParams(searchParams);
    if (farmerId === 'All') {
        newSearchParams.delete('farmer');
    } else {
        newSearchParams.set('farmer', farmerId);
    }
    setSearchParams(newSearchParams);
  };


  if (view === 'all') {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-800">{t('products.allOurProducts')}</h1>
          <p className="mt-4 text-lg text-gray-600">{t('products.explore')}</p>
        </div>
        <div className="space-y-16">
          {categories.map(category => {
            const categoryProducts = products.filter(p => p.category === category.name); // Use products from context
            if (categoryProducts.length === 0) return null;

            return (
              <section key={category.id}>
                <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b-2 border-primary pb-2">{category.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {categoryProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-800">{t('products.ourSelection')}</h1>
        <p className="mt-4 text-lg text-gray-600">{t('products.browse')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <aside className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm h-fit border">
          <h2 className="text-2xl font-bold mb-6">Filters</h2>
          <div className="mb-6">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              id="search"
              placeholder="e.g. Apples"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="mb-6 space-y-3">
             <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="organic" 
                  checked={organicOnly} 
                  onChange={e => setOrganicOnly(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="organic" className="ml-2 block text-sm text-gray-700">{t('products.organicOnly')}</label>
             </div>
             <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="instock" 
                  checked={inStockOnly} 
                  onChange={e => setInStockOnly(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="instock" className="ml-2 block text-sm text-gray-700">{t('products.inStock')}</label>
             </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{t('products.category')}</h3>
            <ul className="space-y-2">
              {['All', ...categories.map(c => c.name)].map(cat => (
                <li key={cat}>
                  <button
                    onClick={() => handleCategoryChange(cat)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedCategory === cat ? 'bg-light-green text-primary font-semibold' : 'hover:bg-gray-100'}`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {/* New: Farmer Filter */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{t('products.farmer')}</h3>
            <ul className="space-y-2">
              <li>
                <button
                    onClick={() => handleFarmerChange('All')}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedFarmer === 'All' ? 'bg-light-green text-primary font-semibold' : 'hover:bg-gray-100'}`}
                >
                    {t('products.allFarmers')}
                </button>
              </li>
              {farmersList.map(farmer => (
                <li key={farmer.id}>
                  <button
                    onClick={() => handleFarmerChange(farmer.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedFarmer === farmer.id ? 'bg-light-green text-primary font-semibold' : 'hover:bg-gray-100'}`}
                  >
                    {farmer.fullName}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border">
            <p className="text-gray-600">{filteredAndSortedProducts.length} products found</p>
            <div className="relative">
                <select 
                    id="sort" 
                    className="appearance-none bg-transparent pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                >
                    <option value="name-asc">Sort by Name (A-Z)</option>
                    <option value="name-desc">Sort by Name (Z-A)</option>
                    <option value="price-asc">Sort by Price (Low-High)</option>
                    <option value="price-desc">Sort by Price (High-Low)</option>
                </select>
                <ChevronDownIcon className="w-5 h-5 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredAndSortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
             <div className="text-center py-20 bg-white rounded-2xl shadow-lg border">
                <h3 className="text-2xl font-semibold text-gray-700">No Products Found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your filters or selecting another category.</p>
                <button onClick={() => { handleCategoryChange('All'); handleFarmerChange('All'); setOrganicOnly(false); setInStockOnly(false); }} className="mt-4 text-primary font-semibold hover:underline">Clear Filters</button>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
