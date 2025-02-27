
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomButton from '../ui/CustomButton';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-lg shadow-sm py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-quantum-700 to-quantum-500 bg-clip-text text-transparent">
            QuantumScribe
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/#features" className="text-sm font-medium text-foreground/80 hover:text-quantum-600 transition-colors">
            Features
          </Link>
          <Link to="/#benefits" className="text-sm font-medium text-foreground/80 hover:text-quantum-600 transition-colors">
            Benefits
          </Link>
          <Link to="/#roadmap" className="text-sm font-medium text-foreground/80 hover:text-quantum-600 transition-colors">
            Roadmap
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <Link to="/dashboard">
              <CustomButton variant="quantum" size="sm">
                Dashboard
              </CustomButton>
            </Link>
          ) : (
            <>
              <Link to="/auth">
                <CustomButton variant="outline" size="sm">
                  Sign In
                </CustomButton>
              </Link>
              <Link to="/auth">
                <CustomButton variant="quantum" size="sm" withArrow>
                  Get Started
                </CustomButton>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden flex items-center"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg w-full absolute top-full left-0 right-0 animate-fade-in">
          <div className="container mx-auto px-6 py-6 flex flex-col space-y-6">
            <Link 
              to="/#features" 
              className="text-base font-medium text-foreground/80 hover:text-quantum-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/#benefits" 
              className="text-base font-medium text-foreground/80 hover:text-quantum-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Benefits
            </Link>
            <Link 
              to="/#roadmap" 
              className="text-base font-medium text-foreground/80 hover:text-quantum-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Roadmap
            </Link>
            <div className="flex flex-col space-y-3 pt-3 border-t">
              {user ? (
                <Link to="/dashboard">
                  <CustomButton variant="quantum" className="w-full justify-center">
                    Dashboard
                  </CustomButton>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <CustomButton variant="outline" className="w-full justify-center">
                      Sign In
                    </CustomButton>
                  </Link>
                  <Link to="/auth">
                    <CustomButton variant="quantum" className="w-full justify-center" withArrow>
                      Get Started
                    </CustomButton>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
