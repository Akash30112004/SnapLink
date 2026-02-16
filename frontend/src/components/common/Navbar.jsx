import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, MessageSquare } from 'lucide-react';
import { ROUTES } from '../../utils/constants';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#022C22]/95 backdrop-blur-lg border-b border-[#064E3B]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-linear-to-br from-[#10B981] to-[#065F46] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-[#10B981] to-[#D1FAE5] bg-clip-text text-transparent">
                SnapLink
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to={ROUTES.HOME}
                className="text-[#D1FAE5] hover:text-[#10B981] transition-colors duration-200 font-medium"
              >
                Home
              </Link>
              <a
                href="#features"
                className="text-[#D1FAE5] hover:text-[#10B981] transition-colors duration-200 font-medium"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-[#D1FAE5] hover:text-[#10B981] transition-colors duration-200 font-medium"
              >
                How It Works
              </a>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to={ROUTES.LOGIN}
                className="px-5 py-2 rounded-lg text-[#D1FAE5] hover:bg-[#064E3B] transition-colors duration-200 font-medium"
              >
                Login
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="px-5 py-2 rounded-lg bg-linear-to-r from-[#10B981] to-[#065F46] text-white font-medium hover:shadow-lg hover:shadow-[#10B981]/30 transform hover:scale-105 transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[#064E3B] text-[#10B981] transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-[#064E3B]/30 py-4 space-y-3 animate-fade-in">
              <Link
                to={ROUTES.HOME}
                className="block px-4 py-2 text-[#D1FAE5] hover:bg-[#064E3B] rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <a
                href="#features"
                className="block px-4 py-2 text-[#D1FAE5] hover:bg-[#064E3B] rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block px-4 py-2 text-[#D1FAE5] hover:bg-[#064E3B] rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <div className="flex gap-2 px-4 pt-2">
                <Link
                  to={ROUTES.LOGIN}
                  className="flex-1 px-4 py-2 rounded-lg text-[#D1FAE5] hover:bg-[#064E3B] transition-colors text-center font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="flex-1 px-4 py-2 rounded-lg bg-linear-to-r from-[#10B981] to-[#065F46] text-white font-medium text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Navbar Spacer */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;
