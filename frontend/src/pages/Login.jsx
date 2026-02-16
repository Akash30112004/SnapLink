import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, MessageSquare } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { ROUTES } from '../utils/constants';
import { validateEmail, validatePassword } from '../utils/helpers';
import authService from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      await authService.login(formData);
      navigate(ROUTES.CHAT);
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setErrors({ password: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#022C22] relative overflow-hidden">
      <nav className="absolute top-0 left-0 right-0 z-20 px-6 pt-6">
        <div className="max-w-6xl mx-auto">
          <Link
            to={ROUTES.HOME}
            aria-label="Go to home"
            className="inline-flex items-center gap-2 text-[#D1FAE5] font-black text-xl tracking-tight hover:text-white transition-colors"
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-linear-to-br from-[#10B981] to-[#065F46] shadow-lg shadow-[#10B981]/30">
              <MessageSquare className="w-4 h-4 text-white" strokeWidth={2.5} />
            </span>
            <span>Snap</span>
            <span className="text-[#10B981]">Link</span>
          </Link>
        </div>
      </nav>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-linear-to-br from-[#10B981] to-[#065F46] rounded-full blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-linear-to-br from-[#064E3B] to-[#10B981] rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-r from-[#10B981]/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-[#10B981] to-[#065F46] rounded-2xl shadow-2xl shadow-[#10B981]/30 mb-6 transform hover:scale-110 transition-transform duration-300">
            <MessageSquare className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-black text-[#D1FAE5] mb-3 tracking-tight">
            Snap<span className="text-[#10B981]">Link</span>
          </h1>
          <p className="text-[#D1FAE5]/80 text-lg font-medium">Connect instantly, chat seamlessly</p>
        </div>

        {/* Login Card */}
        <div className="bg-gradient-to-br from-[#064E3B]/40 to-[#022C22]/40 backdrop-blur-xl border-2 border-[#10B981]/20 rounded-3xl p-10 shadow-2xl shadow-[#10B981]/10 relative overflow-hidden">
          {/* Card Gradient Accent */}
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-[#10B981] via-[#065F46] to-[#10B981]"></div>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#D1FAE5] mb-2">Welcome back</h2>
            <p className="text-[#D1FAE5]/80">Sign in to continue your conversations</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              name="email"
              label="Email Address"
              placeholder="you@example.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
            
            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-2 border-[#10B981]/30 text-[#10B981] focus:ring-4 focus:ring-[#10B981]/20 transition-all cursor-pointer"
                />
                <span className="text-[#D1FAE5]/80 group-hover:text-[#D1FAE5] transition-colors font-medium">Remember me</span>
              </label>
              <Link to={ROUTES.FORGOT_PASSWORD} className="text-[#10B981] hover:text-[#D1FAE5] font-semibold transition-colors">
                Forgot password?
              </Link>
            </div>
            
            <Button 
              type="submit" 
              fullWidth 
              isLoading={isLoading}
              className="mt-8"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#D1FAE5]/80">
              Don't have an account?{' '}
              <Link 
                to={ROUTES.REGISTER} 
                className="text-[#10B981] hover:text-[#D1FAE5] font-bold transition-colors inline-flex items-center gap-1 group"
              >
                Create one now
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8 font-medium">
          © 2026 SnapLink. Secure & Private Messaging.
        </p>
      </div>
    </div>
  );
};

export default Login;
