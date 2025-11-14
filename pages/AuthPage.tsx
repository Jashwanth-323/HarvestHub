
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [error, setError] = useState('');

  const { login, signup } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    let success = false;
    if (isLogin) {
      success = login(email, password);
      if (!success) {
        setError('Invalid email or password.');
      }
    } else {
      success = signup(name, email, password, role);
      if (!success) {
        setError('User with this email already exists.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-center text-green-800">
            Welcome to <span className="text-green-600">HarvestHub</span>
          </h1>
          <p className="mt-2 text-center text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isLogin ? 'rounded-t-md' : ''} focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {!isLogin && (
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">I am a:</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input type="radio" name="role" value={UserRole.CUSTOMER} checked={role === UserRole.CUSTOMER} onChange={() => setRole(UserRole.CUSTOMER)} className="form-radio h-4 w-4 text-green-600 transition duration-150 ease-in-out"/>
                  <span className="ml-2 text-sm text-gray-600">Customer</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="role" value={UserRole.FARMER} checked={role === UserRole.FARMER} onChange={() => setRole(UserRole.FARMER)} className="form-radio h-4 w-4 text-green-600 transition duration-150 ease-in-out"/>
                  <span className="ml-2 text-sm text-gray-600">Farmer</span>
                </label>
              </div>
            </div>
          )}
          
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isLogin ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <button
            onClick={() => {setIsLogin(!isLogin); setError('')}}
            className="font-medium text-green-600 hover:text-green-500"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
