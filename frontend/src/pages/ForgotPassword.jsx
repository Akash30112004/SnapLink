import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, MessageSquare, ArrowLeft, Shield } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { ROUTES } from '../utils/constants';
import { validateEmail, validatePassword } from '../utils/helpers';
import authService from '../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Invalid email format' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      setSuccessMessage(response.message);
      setStep(2); // Move to OTP verification step
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      setErrors({ email: message });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    if (!otp) {
      setErrors({ otp: 'OTP is required' });
      return;
    }

    if (otp.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.verifyOtp(email, otp);
      setSuccessMessage(response.message);
      setStep(3); // Move to reset password step
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid or expired OTP';
      setErrors({ otp: message });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.resetPassword(email, otp, newPassword);
      setSuccessMessage(response.message);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 2000);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password. Please try again.';
      setErrors({ newPassword: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrors({});
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccessMessage('OTP resent successfully!');
      setOtp(''); // Clear OTP field
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      setErrors({ otp: message });
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
            <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-[#D1FAE5] mb-3 tracking-tight">
            Reset Password
          </h1>
          <p className="text-[#D1FAE5]/80 text-lg font-medium">
            {step === 1 && "We'll send you an OTP to verify your email"}
            {step === 2 && "Enter the 6-digit OTP sent to your email"}
            {step === 3 && "Create your new secure password"}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= 1 ? 'bg-[#10B981] text-white' : 'bg-[#D1FAE5]/20 text-[#D1FAE5]/40'
            }`}>
              1
            </div>
            <div className={`w-12 h-1 transition-all ${
              step >= 2 ? 'bg-[#10B981]' : 'bg-[#D1FAE5]/20'
            }`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= 2 ? 'bg-[#10B981] text-white' : 'bg-[#D1FAE5]/20 text-[#D1FAE5]/40'
            }`}>
              2
            </div>
            <div className={`w-12 h-1 transition-all ${
              step >= 3 ? 'bg-[#10B981]' : 'bg-[#D1FAE5]/20'
            }`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= 3 ? 'bg-[#10B981] text-white' : 'bg-[#D1FAE5]/20 text-[#D1FAE5]/40'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-[#064E3B]/40 to-[#022C22]/40 backdrop-blur-xl border-2 border-[#10B981]/20 rounded-3xl p-10 shadow-2xl shadow-[#10B981]/10 relative overflow-hidden">
          {/* Card Gradient Accent */}
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-[#10B981] via-[#065F46] to-[#10B981]"></div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl">
              <p className="text-[#10B981] text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#D1FAE5] mb-2">Enter your email</h2>
                <p className="text-[#D1FAE5]/60 text-sm">We'll send a 6-digit OTP to verify your account</p>
              </div>

              <Input
                type="email"
                name="email"
                label="Email Address"
                placeholder="you@example.com"
                icon={Mail}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({});
                }}
                error={errors.email}
              />

              <Button 
                type="submit" 
                fullWidth 
                isLoading={isLoading}
              >
                Send OTP
              </Button>

              <div className="text-center">
                <Link
                  to={ROUTES.LOGIN}
                  className="inline-flex items-center gap-2 text-[#10B981] hover:text-[#D1FAE5] font-semibold transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#D1FAE5] mb-2">Verify OTP</h2>
                <p className="text-[#D1FAE5]/60 text-sm">
                  Enter the 6-digit code sent to <strong className="text-[#10B981]">{email}</strong>
                </p>
              </div>

              <Input
                type="text"
                name="otp"
                label="OTP Code"
                placeholder="123456"
                icon={Shield}
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                  if (errors.otp) setErrors({});
                }}
                error={errors.otp}
                maxLength={6}
              />

              <Button 
                type="submit" 
                fullWidth 
                isLoading={isLoading}
              >
                Verify OTP
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-[#10B981] hover:text-[#D1FAE5] font-semibold transition-colors disabled:opacity-50"
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setErrors({});
                  }}
                  className="text-[#D1FAE5]/60 hover:text-[#D1FAE5] font-medium transition-colors"
                >
                  Change Email
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#D1FAE5] mb-2">Create New Password</h2>
                <p className="text-[#D1FAE5]/60 text-sm">Choose a strong password for your account</p>
              </div>

              <Input
                type="password"
                name="newPassword"
                label="New Password"
                placeholder="Enter new password"
                icon={Lock}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                }}
                error={errors.newPassword}
              />

              <Input
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Re-enter new password"
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }}
                error={errors.confirmPassword}
              />

              <Button 
                type="submit" 
                fullWidth 
                isLoading={isLoading}
              >
                Reset Password
              </Button>

              {successMessage && (
                <div className="text-center text-[#10B981] text-sm font-medium">
                  Redirecting to login...
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
