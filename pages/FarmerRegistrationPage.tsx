
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { FarmerType, UserRole, PendingUserSignupData } from '../types';
import { EyeIcon, EyeSlashIcon } from '../components/icons';


const FarmerRegistrationPage: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { signupActual } = useAppContext(); // Directly use signupActual

    const [formData, setFormData] = useState<PendingUserSignupData>({
        fullName: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        farmLocation: '',
        farmerType: FarmerType.Mixed,
        role: UserRole.Farmer // Default for this form
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.fullName || !formData.email || !formData.mobile || !formData.password || !formData.confirmPassword || !formData.farmLocation || !formData.farmerType) {
            setError('All fields are required.');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setError('Please enter a valid email address.');
          return;
        }
        if (!/^\d{10}$/.test(formData.mobile)) {
          setError('Please enter a valid 10-digit phone number.');
          return;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        
        // Directly call signupActual
        signupActual(formData);
        navigate('/auth'); // Redirect to login after successful registration
    };

  return (
    <div className="min-h-screen bg-light-green flex flex-col">
        <div className="w-full flex flex-col">
            <div className="p-6">
                <Link to="/" className="text-3xl font-extrabold tracking-tight text-gray-800">
                    <span>Harvest</span><span className="font-semibold text-primary">Hub</span>
                </Link>
            </div>
        </div>
        
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
                {t('auth.createFarmerAccount')}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4 animate-fade-in">
                    <Input name="fullName" type="text" label="Full Name" value={formData.fullName} onChange={handleChange} required />
                    <Input name="email" type="email" label="Email Address" value={formData.email} onChange={handleChange} required />
                    <Input name="mobile" type="tel" label="Phone Number" value={formData.mobile} onChange={handleChange} required />
                    <div className="relative">
                        <Input name="password" type={showPassword ? "text" : "password"} label="Password (min. 8 characters)" value={formData.password} onChange={handleChange} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5">
                            {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-500"/> : <EyeIcon className="h-5 w-5 text-gray-500"/>}
                        </button>
                    </div>
                    <div className="relative">
                        <Input name="confirmPassword" type={showPassword ? "text" : "password"} label="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
                    </div>
                    <Input name="farmLocation" type="text" label="Farm Location (Village, District)" value={formData.farmLocation} onChange={handleChange} required />
                    <div>
                        <label htmlFor="farmerType" className="block text-sm font-medium text-gray-700">Type of Farmer</label>
                        <select name="farmerType" id="farmerType" value={formData.farmerType} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                            {Object.values(FarmerType).map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                </div>

            {error && <p className="text-sm text-center text-red-600">{error}</p>}
            
            <div className="flex justify-between items-center pt-4">
                <Link to="/auth" className="font-medium text-primary hover:text-primary-dark">Back to Login</Link>
                
                <button type="submit" className="flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark">Create Account</button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};


interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}
const Input: React.FC<InputProps> = ({ label, ...props}) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input {...props} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
    </div>
)

export default FarmerRegistrationPage;
