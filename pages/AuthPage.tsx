
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole, PendingUserSignupData } from '../types';
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '../components/icons';


const AuthPage: React.FC = () => {
  const [view, setView] = useState<'login' | 'role' | 'signup'>('login');
  const [showAdminLoginHint, setShowAdminLoginHint] = useState(false);
  const { user } = useAppContext();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // ROLE-BASED REDIRECTION AFTER AUTH
  useEffect(() => {
    if (user) {
      let destination = location.state?.from || '/dashboard';
      
      // Admin/Owner always go to Admin panel
      if (user.isOwner || user.role === UserRole.Admin) {
        destination = '/admin';
      }
      
      navigate(destination, { replace: true });
    }
  }, [user, navigate, location.state]);

  const handleRoleSelect = (selectedRole: UserRole) => {
    if (selectedRole === UserRole.Buyer) {
        setView('signup');
        setShowAdminLoginHint(false);
    } else if (selectedRole === UserRole.Farmer) {
        navigate('/farmer-register');
        setShowAdminLoginHint(false);
    } else if (selectedRole === UserRole.Admin) {
        setView('login');
        setShowAdminLoginHint(true);
    }
  };
  
  const handleBack = () => {
      if (view === 'signup' || view === 'role') {
          setView('login');
          setShowAdminLoginHint(false);
      }
  }

  const titles = {
    login: t('auth.welcome'),
    role: t('auth.joinAs'),
    signup: t('auth.createBuyerAccount'),
  };
  
  const subtitles = {
    login: <>{t('auth.noAccount')}{' '} <button onClick={() => setView('role')} className="font-medium text-primary hover:text-primary-dark">{t('auth.signup')}</button></>,
    role: <p className="text-sm text-gray-600">{t('auth.selectRole')}</p>,
    signup: <>{t('auth.hasAccount')}{' '} <button onClick={() => setView('login')} className="font-medium text-primary hover:text-primary-dark">{t('auth.signin')}</button></>,
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.pexels.com/photos/145685/pexels-photo-145685.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}
    >
      <div className="min-h-screen flex flex-col p-4 bg-black/40">
        <div className="w-full flex flex-col mb-12">
            <div className="p-6 text-center">
                <Link to="/" className="text-3xl font-extrabold tracking-tight text-white">
                    <span>Harvest</span><span className="font-semibold text-green-200">Hub</span>
                </Link>
            </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 space-y-6">
            <div>
                {(view !== 'login' && view !== 'role') && (
                    <button onClick={handleBack} className="mb-4 text-gray-500 hover:text-primary flex items-center gap-1 transition-colors">
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">{t('auth.back')}</span>
                    </button>
                )}
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                {titles[view]}
                </h2>
                {subtitles[view] && (
                <p className="mt-2 text-center text-sm text-gray-600">
                    {subtitles[view]}
                </p>
                )}
            </div>
            
            {view === 'login' && <LoginForm showAdminLoginHint={showAdminLoginHint} setShowAdminLoginHint={setShowAdminLoginHint} />}
            {view === 'role' && <RoleSelection onSelect={handleRoleSelect} onBack={handleBack} />}
            {view === 'signup' && <SignupForm />}
            </div>
        </div>
      </div>
    </div>
  );
};


const LoginForm = ({ showAdminLoginHint, setShowAdminLoginHint }: { showAdminLoginHint: boolean; setShowAdminLoginHint: (val: boolean) => void; }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAppContext();
  const { t } = useLanguage();

  useEffect(() => {
    if (showAdminLoginHint) {
      setEmail('admin@example.com');
      setPassword('admin@123');
      setRememberMe(true);
      setShowAdminLoginHint(false);
    } else {
      const rememberedEmail = localStorage.getItem('rememberedUser');
      if (rememberedEmail) {
          setEmail(rememberedEmail);
          setRememberMe(true);
      }
    }
  }, [showAdminLoginHint, setShowAdminLoginHint]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password, rememberMe);
  };
  
  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {showAdminLoginHint && (
        <div className="bg-primary-dark text-white text-center p-3 rounded-md font-medium text-sm border-2 border-white/20">
          {t('auth.adminDemoCredentials')}
        </div>
      )}
      <Input name="email" type="text" label="Email or Phone Number" value={email} onChange={e => setEmail(e.target.value)} required />
      <div className="relative">
        <Input name="password" type={showPassword ? 'text' : 'password'} label="Password" value={password} onChange={e => setPassword(e.target.value)} required />
         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5">
            {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-500"/> : <EyeIcon className="h-5 w-5 text-gray-500"/>}
        </button>
      </div>

      <div className="flex items-center">
        <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary-dark border-gray-300 rounded" />
        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
      </div>

      <div>
        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-all transform active:scale-95">
          {t('auth.signin')}
        </button>
      </div>
    </form>
  )
}

const RoleSelection = ({ onSelect, onBack }: { onSelect: (role: UserRole) => void, onBack: () => void }) => {
    const { t } = useLanguage();
    
    return (
        <div className="space-y-4 pt-4">
            <button
                onClick={() => onSelect(UserRole.Buyer)}
                className="w-full text-left p-4 border-2 rounded-xl hover:bg-light-green hover:border-primary transition-all duration-200 group"
            >
                <h3 className="font-bold text-lg text-gray-800 group-hover:text-primary transition-colors">{t('auth.role.buyer')}</h3>
                <p className="text-sm text-gray-600">{t('auth.role.buyerDesc')}</p>
            </button>
            <button
                onClick={() => onSelect(UserRole.Farmer)}
                className="w-full text-left p-4 border-2 rounded-xl hover:bg-light-green hover:border-primary transition-all duration-200 group"
            >
                <h3 className="font-bold text-lg text-gray-800 group-hover:text-primary transition-colors">{t('auth.role.farmer')}</h3>
                <p className="text-sm text-gray-600">{t('auth.role.farmerDesc')}</p>
            </button>
            <button
                onClick={() => onSelect(UserRole.Admin)}
                className="w-full text-left p-4 border-2 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 group"
            >
                <h3 className="font-bold text-lg text-gray-800">{t('header.admin')}</h3>
                <p className="text-sm text-gray-600">{t('auth.role.adminDesc')}</p>
            </button>
             <div className="text-sm text-center mt-6">
                <button onClick={onBack} className="font-medium text-primary hover:text-primary-dark">
                  {t('auth.backToLogin')}
                </button>
            </div>
        </div>
    );
};


const SignupForm = () => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<PendingUserSignupData>({
        fullName: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        role: UserRole.Buyer
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { signupActual } = useAppContext();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const { fullName, email, mobile, password, confirmPassword } = formData;
        
        if (!fullName || !email || !mobile || !password || !confirmPassword) {
            setError('All fields are required.');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (!/^\d{10}$/.test(mobile)) {
            setError('Please enter a valid 10-digit phone number.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        
        // signupActual now handles auto-login internally
        signupActual(formData);
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <Input name="fullName" type="text" label="Full Name" placeholder="John Doe" value={formData.fullName} onChange={handleChange} required />
            <Input name="email" type="email" label="Email Address" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
            <Input name="mobile" type="tel" label="Phone Number" placeholder="1234567890" value={formData.mobile} onChange={handleChange} required />
            
            <div className="relative">
                <Input name="password" type={showPassword ? "text" : "password"} label="Password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5">
                    {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-500"/> : <EyeIcon className="h-5 w-5 text-gray-500"/>}
                </button>
            </div>
            <div className="relative">
                <Input name="confirmPassword" type={showPassword ? "text" : "password"} label="Confirm Password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
            </div>

            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
            
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-all transform active:scale-95">
                {t('auth.createAccount')}
            </button>
        </form>
    );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}
const Input: React.FC<InputProps> = ({ label, ...props}) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-semibold text-gray-700">{label}</label>
        <input {...props} className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${props.className || ''}`} />
    </div>
)

export default AuthPage;
