import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  FileText, 
  TrendingUp, 
  Map, 
  Settings, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Monitor,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LogoutConfirmation } from './LogoutConfirmation';

const navigationItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Resume Analysis', href: '/resume-analysis', icon: FileText },
  { name: 'Role Suggestions', href: '/role-suggestions', icon: TrendingUp },
  { name: 'Openings Heatmap', href: '/heatmap', icon: Map },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme, actualTheme } = useTheme();

  const handleLogoutClick = () => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    setShowLogoutConfirmation(true);
  };

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    
    try {
      // Clear any local storage data
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-auth-token');
      
      // Clear session storage
      sessionStorage.clear();
      
      // Sign out from Supabase
      await signOut();
      
      // Small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to sign in page
      navigate('/auth/signin', { replace: true });
      
      // Close confirmation dialog
      setShowLogoutConfirmation(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, still redirect to sign in
      navigate('/auth/signin', { replace: true });
      setShowLogoutConfirmation(false);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirmation(false);
  };

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <>
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 font-bold text-xl text-primary-600 dark:text-primary-400"
            >
              <TrendingUp className="w-6 h-6" />
              <span>Job Prep Heatmap</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === item.href
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Desktop Theme & Profile */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Theme Selector - Improved contrast and readability */}
              <div className="relative">
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="
                    appearance-none 
                    bg-white dark:bg-gray-800 
                    border-2 border-gray-300 dark:border-gray-600 
                    rounded-lg 
                    px-4 py-2.5 
                    text-sm font-medium
                    text-gray-900 dark:text-white
                    shadow-sm
                    focus:outline-none 
                    focus:ring-2 
                    focus:ring-primary-500 
                    focus:border-primary-500
                    hover:border-gray-400 dark:hover:border-gray-500
                    transition-all duration-200
                    cursor-pointer
                    min-w-[100px]
                    pr-8
                  "
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  {themeOptions.map((option) => (
                    <option 
                      key={option.value} 
                      value={option.value}
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.email?.split('@')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2"
                    >
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white text-center">
                          {user?.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          Signed in
                        </p>
                      </div>
                      
                      <Link
                        to="/settings"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Account Settings</span>
                      </Link>
                      
                      <button
                        onClick={handleLogoutClick}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="container mx-auto px-4 py-4 space-y-2">
                {/* User Info */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Navigation Items */}
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                        location.pathname === item.href
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
                
                {/* Theme Selector - Mobile version with improved contrast */}
                <div className="px-3 py-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as any)}
                    className="
                      w-full 
                      px-4 py-3 
                      border-2 border-gray-300 dark:border-gray-600 
                      rounded-lg 
                      bg-white dark:bg-gray-800 
                      text-gray-900 dark:text-white
                      font-medium
                      shadow-sm
                      focus:outline-none 
                      focus:ring-2 
                      focus:ring-primary-500 
                      focus:border-primary-500
                      appearance-none
                      cursor-pointer
                    "
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 1rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em'
                    }}
                  >
                    {themeOptions.map((option) => (
                      <option 
                        key={option.value} 
                        value={option.value}
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Logout Button */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center space-x-3 px-3 py-3 w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation
        isOpen={showLogoutConfirmation}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        loading={loggingOut}
      />
    </>
  );
};