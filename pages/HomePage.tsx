import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categories } from '../data';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { useAppContext } from '../context/AppContext';

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, products } = useAppContext(); // Access products from context
  const featuredProductIds = ['p2', 'p5', 'p7', 'p11'];
  const featuredProducts = products.filter(p => featuredProductIds.includes(p.id));
  const grainsProducts = products.filter(p => p.category === 'Grains').slice(0, 4); // Show first 4

  const handleShopNow = () => {
    if (user) {
      navigate('/shop?view=all');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white">
        <div className="absolute inset-0">
          <img 
            src="https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            alt="Farmer tending to crops in a lush field at sunrise" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 px-4">
          <h1 className="text-4xl md:text-6xl font-bold" dangerouslySetInnerHTML={{ __html: t('home.hero.title') }} />
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">{t('home.hero.subtitle')}</p>
          <button
            onClick={handleShopNow}
            className="mt-8 inline-block bg-primary text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-primary-dark transition-transform transform hover:scale-105 duration-300 shadow-lg"
          >
            {t('home.hero.shopNow')}
          </button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">{t('home.categories.title')}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(category => (
              <Link key={category.id} to={`/shop?category=${category.name}`} className="group relative rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <img src={category.imageUrl} alt={category.name} className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h3 className="text-2xl font-semibold text-white">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-light-green">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">{t('home.featured.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
           <div className="text-center mt-12">
            <Link to="/shop?view=all" className="bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-primary-dark transition-colors duration-300">
                View All Products
            </Link>
          </div>
        </div>
      </section>

       {/* Grains Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">{t('home.grains.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {grainsProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/shop?category=Grains" className="bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-primary-dark transition-colors duration-300">
                View All Grains
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;