import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';
import { authService } from '../services/authService';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  AlertTriangle, 
  Sun, 
  Moon, 
  Compass, 
  Loader2 
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { instance } = useMsal();
  
  // Local form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    
    // Apply theme on load
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Toggle Dark/Light Theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Redirect based on user role
  const redirectUser = (role) => {
    switch (role) {
      case 'Employee':
        navigate('/dashboard/employee');
        break;
      case 'IT Support Engineer':
        navigate('/dashboard/support');
        break;
      case 'Team Lead':
        navigate('/dashboard/teamlead');
        break;
      case 'Administrator':
        navigate('/dashboard/admin');
        break;
      default:
        navigate('/dashboard/employee');
    }
  };

  // Local Form Validation
  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return false;
    }
    
    // Simple Email Regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    
    return true;
  };

  // Standard Local Credentials Login
  const handleLocalLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const { user } = await authService.login(email, password, rememberMe);
      
      // Store email if Remember Me is checked
      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
      } else {
        localStorage.removeItem('remembered_email');
      }
      
      // Redirect based on role
      redirectUser(user.role);
    } catch (err) {
      setError(err.message || 'An error occurred during sign-in.');
    } finally {
      setLoading(false);
    }
  };

  // Microsoft AD SSO Login
  const handleMicrosoftLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // Initiate popup login with Azure AD MSAL
      const loginResponse = await instance.loginPopup(loginRequest);
      
      // Exchange and handle token logic
      const { user } = await authService.handleMsalLoginSuccess(loginResponse);
      
      // Redirect based on role
      redirectUser(user.role);
    } catch (err) {
      console.error('SSO Login Error:', err);
      // Friendly message based on standard MSAL error types
      if (err.name === 'BrowserAuthError' && err.errorCode === 'user_cancelled') {
        setError('Sign-in was cancelled. Please try again.');
      } else {
        setError('Microsoft authentication failed. Please contact your IT support.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between transition-colors duration-300 bg-slate-50 dark:bg-slate-950">
      
      {/* Theme Switcher Toggle (Top Right) */}
      <div className="flex justify-end p-4 md:p-6">
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      {/* Main Login Card Wrapper */}
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-xl rounded-2xl p-6 md:p-10 transition-all duration-300">
          
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 dark:bg-blue-500 text-white mb-4 shadow-lg shadow-blue-500/20">
              <Compass size={28} className="animate-spin-slow" />
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              IT Portal
            </h1>
            <p className="mt-1.5 text-sm md:text-base font-medium text-slate-500 dark:text-slate-400">
              IT Ticket & Asset Management System
            </p>
          </div>

          {/* Alert Error Messages */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 text-sm animate-fade-in">
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
              <div>
                <span className="font-semibold">Sign in failed: </span>
                {error}
              </div>
            </div>
          )}

          {/* Primary SSO Option: Microsoft Login */}
          <div className="mb-6">
            <button
              onClick={handleMicrosoftLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-blue-600/30 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-950/70 font-semibold transition-all duration-200 shadow-sm disabled:opacity-50"
            >
              {/* Official Microsoft Color Grid Logo SVG */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0H11V11H0V0Z" fill="#F25022"/>
                <path d="M12 0H23V11H12V0Z" fill="#7FBA00"/>
                <path d="M0 12H11V23H0V12Z" fill="#00A4EF"/>
                <path d="M12 12H23V23H12V12Z" fill="#FFB900"/>
              </svg>
              <span>Sign in with Microsoft</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <span className="relative px-3 bg-white dark:bg-slate-900 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              or use local login
            </span>
          </div>

          {/* Fallback local credentials form */}
          <form onSubmit={handleLocalLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="block w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-sm md:text-base disabled:opacity-55"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label 
                  htmlFor="password" 
                  className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Password
                </label>
                <a 
                  href="#forgot" 
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Please contact your IT helpdesk (support@company.com) to reset your local password.");
                  }}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="block w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-sm md:text-base disabled:opacity-55"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me Box */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500/30 border-slate-300 dark:border-slate-700 rounded transition-all duration-200"
              />
              <label 
                htmlFor="remember-me" 
                className="ml-2.5 block text-sm font-medium text-slate-600 dark:text-slate-400 select-none cursor-pointer"
              >
                Remember me
              </label>
            </div>

            {/* Submit Local Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 border border-transparent font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Footer Branding */}
      <footer className="py-6 text-center text-xs text-slate-400 dark:text-slate-600">
        <p>&copy; {new Date().getFullYear()} Enterprise IT Infrastructure. All rights reserved.</p>
        <p className="mt-1">For assistance, please contact the IT Helpdesk.</p>
      </footer>
    </div>
  );
};

export default Login;
