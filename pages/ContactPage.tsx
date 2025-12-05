
import React from 'react';
import { MailIcon, PhoneIcon, MapPinIcon } from '../components/icons';
import { useLanguage } from '../context/LanguageContext';
import BackToHomeButton from '../components/BackToHomeButton';

const ContactPage: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <BackToHomeButton />
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">{t('contact.title')}</h1>
          <p className="mt-4 text-lg text-gray-600">{t('contact.subtitle')}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-white p-8 rounded-lg shadow-md border space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Get in Touch</h2>
            <div className="flex items-center space-x-4">
              <MapPinIcon className="w-6 h-6 text-primary" />
              <p className="text-gray-700">Bengaluru, Karnataka, India</p>
            </div>
            <div className="flex items-center space-x-4">
              <PhoneIcon className="w-6 h-6 text-primary" />
              <p className="text-gray-700">8088408480</p>
            </div>
            <div className="flex items-center space-x-4">
              <MailIcon className="w-6 h-6 text-primary" />
              <p className="text-gray-700">harvesthub@gmail.com</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md border">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" id="name" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea id="message" rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"></textarea>
              </div>
              <div>
                <button type="submit" className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
