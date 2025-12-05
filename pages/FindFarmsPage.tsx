

import React, { useState } from 'react';
import { GenerateContentResponse } from '@google/genai';
import { findFarmsNear } from '../services/geminiService';
import { useLanguage } from '../context/LanguageContext';
import { MapPinIcon } from '../components/icons';
import BackToHomeButton from '../components/BackToHomeButton';

const FindFarmsPage: React.FC = () => {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<GenerateContentResponse | null>(null);
    const [coords, setCoords] = useState<{ latitude: number, longitude: number } | null>(null);


    const handleFindFarms = () => {
        setIsLoading(true);
        setResult(null);
        setError(null);
        setCoords(null);
        setLoadingMessage(t('findFarms.gettingLocation'));

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ latitude, longitude });
                setLoadingMessage(t('findFarms.findingFarms'));
                try {
                    const response = await findFarmsNear(latitude, longitude);
                    setResult(response);
                } catch (apiError) {
                    setError(t('findFarms.apiError'));
                } finally {
                    setIsLoading(false);
                }
            },
            () => {
                setError(t('findFarms.locationError'));
                setIsLoading(false);
            },
            { timeout: 10000 }
        );
    };
    
    const groundingChunks = result?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <BackToHomeButton />
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-800">{t('findFarms.title')}</h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">{t('findFarms.subtitle')}</p>
                    <button
                        onClick={handleFindFarms}
                        disabled={isLoading}
                        className="mt-8 inline-block bg-primary text-white font-bold text-lg px-10 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? loadingMessage : t('findFarms.button')}
                    </button>
                </div>

                {error && (
                    <div className="mt-8 text-center bg-red-100 text-red-700 p-4 rounded-lg max-w-4xl mx-auto">
                        {error}
                    </div>
                )}
                
                {result && (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-8">
                        {/* Map View */}
                        <div className="md:col-span-2">
                            {coords && (
                                <div className="sticky top-28">
                                    <h2 className="text-2xl font-bold mb-4">Your Area</h2>
                                    <div className="rounded-xl overflow-hidden shadow-lg border h-96 md:h-[60vh]">
                                        <iframe
                                            title="Your Location Map"
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            allowFullScreen
                                            src={`https://www.google.com/maps/embed/v1/view?key=${process.env.API_KEY}&center=${coords.latitude},${coords.longitude}&zoom=12`}
                                        >
                                        </iframe>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Results View */}
                        <div className="md:col-span-3 bg-white p-8 rounded-lg shadow-md border space-y-6">
                            <div className="prose lg:prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: result.text.replace(/\n/g, '<br />') }} />

                            {groundingChunks.length > 0 && (
                                <div className="pt-6 border-t">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('findFarms.sources')}</h3>
                                    <ul className="space-y-2">
                                        {groundingChunks.map((chunk: any, index: number) => (
                                            <li key={index} className="flex items-start">
                                                <MapPinIcon className="w-5 h-5 text-primary flex-shrink-0 mt-1 mr-2" />
                                                <a 
                                                    href={chunk.maps.uri} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline"
                                                >
                                                    {chunk.maps.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindFarmsPage;