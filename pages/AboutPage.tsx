import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAppContext } from '../context/AppContext'; // Import useAppContext
import BackToHomeButton from '../components/BackToHomeButton';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const { t } = useLanguage();
  const { farmersList } = useAppContext(); // Use farmersList from context

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <BackToHomeButton />
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">{t('about.title')}</h1>
          <p className="mt-4 text-lg text-gray-600">{t('about.subtitle')}</p>
        </div>

        <div className="mt-12 text-gray-700 space-y-6 text-lg">
          <p>
            Welcome to Harvest Hub, your number one source for all things fresh and local. We're dedicated to giving you the very best of farm produce, with a focus on quality, customer service, and supporting our local communities.
          </p>
          <p>
            Founded in 2024, our mission is to bridge the gap between farmers and consumers. We believe in a world where everyone has access to fresh, healthy food, and where local farmers are supported and valued. Our platform allows farmers to sell their produce directly to you, ensuring you get the freshest items while they get a fair price for their hard work.
          </p>
          <p>
            We hope you enjoy our products as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.
          </p>
        </div>

        <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Meet Our Farmers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {farmersList.map(farmer => ( // Use farmersList
                    <Link to={`/farms/${farmer.id}`} key={farmer.id} className="text-center group">
                        <img 
                          src={`https://i.pravatar.cc/150?u=${farmer.id}`} // Use user ID for consistent avatar
                          alt={farmer.fullName} 
                          className="w-32 h-32 rounded-full mx-auto shadow-lg group-hover:scale-105 transition-transform duration-300" 
                        />
                        <h3 className="mt-4 text-xl font-semibold group-hover:text-primary transition-colors">{farmer.fullName}</h3>
                        <p className="text-gray-600">{farmer.farmLocation}</p>
                    </Link>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;