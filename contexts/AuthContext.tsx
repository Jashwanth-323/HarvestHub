import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { User, UserRole } from '../types';
import { USERS } from '../constants';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = useCallback((email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, [users]);

  const signup = useCallback((name: string, email: string, password: string, role: UserRole): boolean => {
    if (users.some(u => u.email === email)) {
      return false; // User already exists
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      role,
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const value = { currentUser, users, login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};