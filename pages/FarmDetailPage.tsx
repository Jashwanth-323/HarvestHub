
import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';
import BackToHomeButton from '../components/BackToHomeButton';
import ProductCard from '../components/ProductCard';
import { MailIcon, PhoneIcon, MapPinIcon } from '../components/icons';

const FarmDetailPage: React.FC = () => {
  const { farmerId } = useParams<{ farmerId: string }>();
  const { farmersList, products } = useAppContext();
  const { t, language } = useLanguage();

  const farmer = useMemo(() => {
    return farmersList.find(f => f.id === farmerId);
  }, [farmersList, farmerId]);

  const farmerProducts = useMemo(() => {
    return products.filter(p => p.farmerId === farmerId);
  }, [products, farmerId]);

  if (!farmer) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <BackToHomeButton />
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">{t('farmDetail.notFoundTitle')}</h1>
        <p className="text-lg text-gray-600">{t('farmDetail.notFoundSubtitle')}</p>
      </div>
    );
  }

  // Fallback avatar URL for consistent display
  // FIX: Removed farmer.avatarUrl as it's not defined in the User type.
  const avatarUrl = `https://i.pravatar.cc/150?u=${farmer.id}`;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BackToHomeButton />
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8 dark:bg-gray-800 dark:text-gray-100">
        {/* Farm Header */}
        <div className="flex flex-col md:flex-row items-center gap-6 border-b pb-6">
          <img src={avatarUrl} alt={farmer.fullName} className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-primary" />
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-50">{farmer.fullName}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">{farmer.farmLocation} - {farmer.farmerType} {t('farmDetail.farm')}</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('farmDetail.contactInfo')}</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MailIcon className="w-6 h-6 text-primary" />
                <a href={`mailto:${farmer.email}`} className="text-lg text-gray-700 hover:underline dark:text-gray-200">{farmer.email}</a>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-6 h-6 text-primary" />
                <a href={`tel:${farmer.mobile}`} className="text-lg text-gray-700 hover:underline dark:text-gray-200">{farmer.mobile}</a>
              </div>
              {farmer.deliveryAddress?.street && (
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="w-6 h-6 text-primary" />
                  <span className="text-lg text-gray-700 dark:text-gray-200">
                    {`${farmer.deliveryAddress.street}, ${farmer.deliveryAddress.city}, ${farmer.deliveryAddress.state}, ${farmer.deliveryAddress.pincode}`}
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Optional: About the farm / Farmer description */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('farmDetail.aboutFarm')}</h2>
            <p className="text-gray-700 dark:text-gray-200">
              {t('farmDetail.descriptionPlaceholder', { farmName: farmer.fullName })}
              {/* This is a placeholder. In a real app, farmers would provide their own descriptions. */}
            </p>
          </div>
        </div>

        {/* Products Offered */}
        <div className="pt-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">{t('farmDetail.productsOffered')}</h2>
          {farmerProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {farmerProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
              {t('farmDetail.noProducts', { farmName: farmer.fullName })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmDetailPage;