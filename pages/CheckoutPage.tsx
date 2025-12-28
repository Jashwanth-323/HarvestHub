
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import OrderSummary from '../components/OrderSummary';
import BackToHomeButton from '../components/BackToHomeButton';
import QRScannerModal from '../components/QRScannerModal';
import FormInput from '../components/FormInput'; // Centralized FormInput
import { CreditCardIcon, QrCodeIcon, CashIcon, WalletIcon } from '../components/icons'; // Import QrCodeIcon, CashIcon, WalletIcon
import { Address } from '../types';

// List of Indian States and UTs
const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const CheckoutPage: React.FC = () => {
  const { user, showNotification, placeOrder, shippingFee } = useAppContext();
  const navigate = useNavigate();
  
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('upi');

  useEffect(() => {
    if (!user) {
      showNotification('Please log in to proceed to checkout.', 'error');
      navigate('/auth', { state: { from: '/checkout' } });
    }
  }, [user, navigate, showNotification]);
  
  const handleAddressSubmit = (address: Address) => {
    setBillingAddress(address);
  };
  
  const handlePlaceOrder = () => {
    if (!billingAddress) {
      showNotification('Please provide a billing address.', 'error');
      return;
    }
    if (!selectedPayment) {
      showNotification('Please select a payment method.', 'error');
      return;
    }
    
    // Rule: Prevent checkout if shipping is not available (though currently we have a catch-all '120')
    // We could add an "unavailable" state if needed.
    if (shippingFee <= 0 && useAppContext().cartTotal > 0) {
        showNotification('Delivery is not available for this location.', 'error');
        return;
    }

     if(selectedPayment === 'wallet') {
      const total = (useAppContext().cartTotal + shippingFee);
      if((user?.walletBalance || 0) < total) {
        showNotification('Insufficient wallet balance.', 'error');
        return;
      }
    }

    const success = placeOrder(billingAddress, selectedPayment);
    if (success) {
      navigate('/dashboard'); 
    }
  };

  const paymentOptions = [
    { id: 'upi', name: 'UPI', icon: <QrCodeIcon className="w-6 h-6" /> },
    { id: 'card', name: 'Credit/Debit Card', icon: <CreditCardIcon className="w-6 h-6" /> },
    { id: 'cod', name: 'Cash on Delivery', icon: <CashIcon className="w-6 h-6" /> },
    { id: 'wallet', name: 'Wallet', icon: <WalletIcon className="w-6 h-6" /> },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BackToHomeButton />
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Secure Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 dark:bg-gray-800">
          {!billingAddress ? (
            <BillingAddressForm onSubmit={handleAddressSubmit} />
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Choose Payment Method</h2>
                <button onClick={() => setBillingAddress(null)} className="text-primary text-sm font-semibold hover:underline">Change Address</button>
              </div>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 flex flex-col space-y-3 border-b md:border-b-0 md:border-r pr-4 pb-4 md:pb-0 dark:border-gray-700">
                  {paymentOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedPayment(option.id)}
                      className={`flex items-center space-x-4 w-full text-left p-3 rounded-lg transition-colors duration-200 ${selectedPayment === option.id ? 'bg-primary text-white shadow' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      {option.icon}
                      <span className="font-semibold">{option.name}</span>
                    </button>
                  ))}
                </div>
                
                <div className="flex-1 md:pl-4">
                  {selectedPayment === 'upi' && <UpiPayment showNotification={showNotification} />}
                  {selectedPayment === 'card' && <CardPayment />}
                  {selectedPayment === 'cod' && <CodPayment />}
                  {selectedPayment === 'wallet' && <WalletPayment />}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <OrderSummary>
            {billingAddress && (
              <button 
                onClick={handlePlaceOrder} 
                className="w-full bg-primary text-white font-bold text-lg py-3 rounded-full hover:bg-primary-dark transition-transform transform hover:scale-105 duration-300 shadow-lg"
              >
                Place Order
              </button>
            )}
          </OrderSummary>
        </div>
      </div>
    </div>
  );
};


const BillingAddressForm: React.FC<{ onSubmit: (address: Address) => void }> = ({ onSubmit }) => {
    const { user, updateShippingLocation, formatPrice, shippingFee } = useAppContext();
    const [formData, setFormData] = useState<Address>({
        fullName: user?.fullName || '',
        phone: user?.mobile || '',
        street: user?.deliveryAddress?.street || '',
        city: user?.deliveryAddress?.city || '',
        district: user?.deliveryAddress?.district || '',
        state: user?.deliveryAddress?.state || '',
        country: user?.deliveryAddress?.country || 'India',
        pincode: user?.deliveryAddress?.pincode || '',
    });
    const [errors, setErrors] = useState<Partial<Address>>({});

    // Instantly update shipping fee when location-related fields change
    useEffect(() => {
        updateShippingLocation(formData);
    }, [formData.city, formData.district, formData.state, updateShippingLocation]);

    const validate = (): boolean => {
        const newErrors: Partial<Address> = {};
        if (!formData.fullName) newErrors.fullName = "Full name is required.";
        if (!formData.phone) newErrors.phone = "Phone number is required.";
        else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Please enter a valid 10-digit phone number.";
        if (!formData.street) newErrors.street = "Address is required.";
        if (!formData.city) newErrors.city = "City is required.";
        if (!formData.district) newErrors.district = "District is required.";
        if (!formData.state) newErrors.state = "State is required.";
        if (!formData.pincode) newErrors.pincode = "Pincode is required.";
        else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = "Please enter a valid 6-digit pincode.";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Delivery Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput name="fullName" label="Full Name" value={formData.fullName} onChange={handleChange} error={errors.fullName} />
                    <FormInput name="phone" label="Phone Number" value={formData.phone} onChange={handleChange} error={errors.phone} />
                </div>
                <FormInput name="street" label="Street / Village / Area" value={formData.street} onChange={handleChange} error={errors.street} />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput name="city" label="City" value={formData.city} onChange={handleChange} error={errors.city} placeholder="e.g. Mysuru" />
                    <FormInput name="district" label="District" value={formData.district} onChange={handleChange} error={errors.district} placeholder="e.g. Mysuru" />
                    <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                        <select name="state" id="state" value={formData.state} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700">
                            <option value="">Select State</option>
                            {indianStates.map(state => <option key={state} value={state}>{state}</option>)}
                        </select>
                         {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput name="country" label="Country" value={formData.country} onChange={handleChange} error={errors.country} disabled />
                    <FormInput name="pincode" label="Pincode" value={formData.pincode} onChange={handleChange} error={errors.pincode} />
                </div>

                <div className="bg-light-green p-4 rounded-xl border border-primary/20 mt-4 dark:bg-primary/10">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium dark:text-gray-300">Estimated Shipping Fee:</span>
                        <span className="text-xl font-bold text-primary">{shippingFee > 0 ? formatPrice(shippingFee) : '...'}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tight">Based on distance between farmer and delivery address</p>
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark transition-colors shadow-lg">Save and Continue to Payment</button>
                </div>
            </form>
        </div>
    );
};


// --- Payment Method Components ---
const UpiPayment = ({ showNotification }: { showNotification: (msg: string, type: 'success'|'error') => void }) => {
    const [upiId, setUpiId] = useState('');
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const handleScanSuccess = (data: string) => {
        setUpiId(data);
        showNotification(`Scanned UPI ID: ${data}`, 'success');
    };

    return (
        <div className="animate-fade-in">
            {isScannerOpen && <QRScannerModal onClose={() => setIsScannerOpen(false)} onScan={handleScanSuccess} />}
            <h3 className="font-semibold text-lg mb-4">Pay with UPI</h3>
            <div className="flex flex-col items-center gap-4">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=harvesthub@okhdfc&pn=HarvestHub" alt="UPI QR Code" className="w-48 h-48 border-4 border-primary rounded-lg p-2 bg-white" />
                <button 
                  onClick={() => setIsScannerOpen(true)}
                  className="w-full flex justify-center items-center space-x-2 bg-gray-800 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-300 shadow-md"
                >
                  <QrCodeIcon className="w-5 h-5" />
                  <span>Scan QR to Pay</span>
                </button>
                <div className="text-center text-gray-500 my-2 w-full flex items-center before:flex-1 before:border-b before:mr-2 after:flex-1 after:border-b after:ml-2">OR</div>
                <FormInput name="upiId" label="Enter UPI ID" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@bank" />
            </div>
        </div>
    );
};

const CardPayment = () => (
    <div className="animate-fade-in">
        <h3 className="font-semibold text-lg mb-4">Credit/Debit Card</h3>
        <div className="space-y-4">
            <FormInput name="cardName" label="Name on Card" placeholder="John M. Doe" />
            <FormInput name="cardNumber" label="Card Number" placeholder="**** **** **** 1234" />
            <div className="grid grid-cols-2 gap-4">
                <FormInput name="expiry" label="Expiration Date (MM/YY)" placeholder="MM/YY" />
                <FormInput name="cvc" label="CVC" placeholder="123" />
            </div>
        </div>
    </div>
);

const CodPayment = () => (
    <div className="animate-fade-in">
        <h3 className="font-semibold text-lg mb-4">Cash on Delivery</h3>
        <p className="text-gray-600 bg-light-green p-4 rounded-lg dark:text-gray-300 dark:bg-gray-700">You can pay in cash to our delivery agent upon receiving your goods. Please keep exact change for a smooth transaction.</p>
    </div>
);

const WalletPayment = () => {
  const { user, cartTotal, formatPrice, shippingFee } = useAppContext();
  const total = cartTotal + shippingFee;
  const balance = user?.walletBalance || 0;
  const remaining = balance - total;

  return (
    <div className="animate-fade-in">
      <h3 className="font-semibold text-lg mb-4">HarvestHub Wallet</h3>
      <div className="space-y-3 bg-light-green p-4 rounded-lg dark:bg-gray-700">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Available Balance:</span>
          <span className="font-semibold">{formatPrice(balance)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Order Total (incl. shipping):</span>
          <span className="font-semibold">- {formatPrice(total)}</span>
        </div>
        <div className={`flex justify-between pt-2 border-t font-bold ${remaining < 0 ? 'text-red-500' : 'text-primary'}`}>
          <span>Remaining Balance:</span>
          <span>{formatPrice(remaining)}</span>
        </div>
      </div>
      {remaining < 0 && <p className="text-red-500 text-sm mt-2 font-bold animate-pulse">Insufficient balance. Please choose another payment method.</p>}
    </div>
  );
};

export default CheckoutPage;
