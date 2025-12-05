

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';
import { generateRecipeStream } from '../services/geminiService';
import { PlusIcon, MinusIcon, ArrowLeftIcon, ArrowRightIcon } from '../components/icons';
import BackToHomeButton from '../components/BackToHomeButton';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';


const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addToCart, buyNow, formatPrice, products, farmersList } = useAppContext(); // Access products and farmersList from context
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [recipe, setRecipe] = useState('');
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const { t } = useLanguage();

  // State and ref for zoom functionality
  const [isZoomVisible, setIsZoomVisible] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const ZOOM_LEVEL = 2.5;

  // Carousel state for related products
  const [currentSlide, setCurrentSlide] = useState(0);
  const productsPerSlide = 4; // Number of products to show per slide


  useEffect(() => {
    // Find product in the global products list from context
    const foundProduct = products.find(p => p.id === productId); 
    setProduct(foundProduct);
    setCurrentSlide(0); // Reset carousel when product changes
    setRecipe(''); // Clear recipe when product changes
  }, [productId, products]); // Add products to dependency array

  // Memoized related products calculation
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products.filter(
      p => p.category === product.category && p.id !== product.id
    ).slice(0, 8); // Limit to a reasonable number of related products
  }, [product, products]);

  const totalSlides = Math.ceil(relatedProducts.length / productsPerSlide);

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev === totalSlides - 1 ? 0 : prev + 1));
  };


  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    // Calculate cursor position relative to the image container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate position as a percentage for background-position
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setZoomPosition({ x: xPercent, y: yPercent });
  };

  const handleGetRecipe = async () => {
    if (!product) return;
    setIsLoadingRecipe(true);
    setRecipe('');
    try {
        const stream = generateRecipeStream(product.name);
        for await (const chunk of stream) {
            setRecipe(prev => prev + chunk);
        }
    } catch (error) {
        console.error("Failed to stream recipe", error);
        setRecipe(t('productDetail.recipeGenerationError'));
    } finally {
        setIsLoadingRecipe(false);
    }
  };
  
  const handleBuyNow = () => {
    if (!product) return;
    buyNow(product, quantity);
    navigate('/cart');
  };


  if (!product) {
    return <div className="text-center py-20">Product not found.</div>;
  }
  
  const farmer = farmersList.find(f => f.id === product.farmerId); // Get farmer from context

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BackToHomeButton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Product Image with Zoom */}
        <div className="relative">
          <div
            ref={imageContainerRef}
            onMouseEnter={() => setIsZoomVisible(true)}
            onMouseLeave={() => setIsZoomVisible(false)}
            onMouseMove={handleMouseMove}
            className="rounded-3xl shadow-2xl overflow-hidden cursor-zoom-in"
          >
            <img src={product.imageUrl} alt={product.name} className="w-full h-auto object-cover block" />
          </div>

          {/* Zoomed Image Pane */}
          <div
            className={`hidden lg:block absolute top-0 left-[105%] w-full h-full bg-no-repeat pointer-events-none transition-opacity duration-300 rounded-3xl shadow-2xl border ${isZoomVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{
              backgroundImage: `url(${product.imageUrl})`,
              backgroundSize: `${ZOOM_LEVEL * 100}%`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            }}
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <span className="text-primary font-semibold">{product.category}</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-800">{product.name}</h1>
          <p className="text-gray-600 text-lg">{product.description}</p>
          <p className="text-4xl font-bold text-primary">
            {formatPrice(product.price)}
            <span className="text-xl font-normal text-gray-500"> / {product.unit}</span>
          </p>

          {farmer && (
             <div className="bg-light-green p-4 rounded-2xl flex items-center space-x-4">
                <img src={`https://i.pravatar.cc/150?u=${farmer.id}`} alt={farmer.fullName} className="w-16 h-16 rounded-full"/>
                <div>
                    <p className="text-sm text-gray-500">Sold by</p>
                    <Link to={`/farms/${farmer.id}`} className="text-lg font-semibold text-gray-800 hover:underline">{farmer.fullName}</Link>
                    <p className="text-gray-600">{farmer.farmLocation}</p>
                </div>
             </div>
          )}

          {/* Add to Cart Controls */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center border border-gray-300 rounded-full p-2">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 rounded-full hover:bg-gray-100"><MinusIcon className="w-6 h-6" /></button>
              <span className="px-6 text-xl font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-2 rounded-full hover:bg-gray-100"><PlusIcon className="w-6 h-6" /></button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch gap-4">
            <button
              onClick={() => addToCart(product, quantity)}
              className="flex-grow bg-primary text-white font-bold text-lg px-8 py-3 rounded-full hover:bg-primary-dark transition-transform transform hover:scale-105 duration-300 shadow-lg"
            >
              Add to Cart
            </button>
             <button
              onClick={handleBuyNow}
              className="flex-grow bg-secondary text-white font-bold text-lg px-8 py-3 rounded-full hover:bg-orange-600 transition-transform transform hover:scale-105 duration-300 shadow-lg"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

       {/* Recipe Section */}
       <div className="mt-20 pt-12 border-t">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">{t('productDetail.recipeIdeasTitle')}</h2>
          <div className="text-center mb-8">
            <button
                onClick={handleGetRecipe}
                disabled={isLoadingRecipe}
                className="bg-secondary text-white font-bold text-lg px-8 py-3 rounded-full hover:bg-orange-600 transition-transform transform hover:scale-105 duration-300 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isLoadingRecipe ? t('productDetail.generatingRecipe') : t('productDetail.generateRecipeButton', { productName: product.name })}
            </button>
          </div>

          {(isLoadingRecipe || recipe) && (
              <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg prose lg:prose-xl">
                  {recipe ? <div dangerouslySetInnerHTML={{ __html: recipe.replace(/\n/g, '<br />') }} /> : <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>}
              </div>
          )}
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">{t('productDetail.relatedProductsTitle')}</h2>
            <div className="relative flex items-center justify-center">
              <button
                onClick={handlePrevSlide}
                disabled={totalSlides <= 1}
                className="absolute left-0 z-10 p-2 bg-white rounded-full shadow-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label={t('common.previous')}
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>

              <div className="overflow-hidden w-full max-w-screen-xl px-12"> {/* Added px-12 to make space for buttons */}
                <div 
                  className="flex transition-transform duration-500 ease-in-out" 
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                    <div key={slideIndex} className="flex-shrink-0 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
                      {relatedProducts.slice(slideIndex * productsPerSlide, (slideIndex + 1) * productsPerSlide).map(relatedProduct => (
                        <ProductCard key={relatedProduct.id} product={relatedProduct} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNextSlide}
                disabled={totalSlides <= 1}
                className="absolute right-0 z-10 p-2 bg-white rounded-full shadow-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label={t('common.next')}
              >
                <ArrowRightIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
        {relatedProducts.length === 0 && product && (
          <div className="mt-20 pt-12 border-t text-center text-gray-600 text-lg">
            <p>{t('productDetail.noRelatedProducts')}</p>
          </div>
        )}
    </div>
  );
};

export default ProductDetailPage;