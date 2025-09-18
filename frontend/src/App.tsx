import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useOutletContext, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CarList from './components/CarList';
import Footer from './components/Footer';
import AuthPage from './components/auth/AuthPage';
import FAQ from './components/FAQ';
import SellPage from './components/SellPage';
import SupportPage from './components/SupportPage';
import ProfilePage from './components/ProfilePage';
import CarDetailsPage from './components/CarDetailsPage';
import ScrollToTopButton from './components/ScrollToTopButton';
import AboutPage from './components/AboutPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Component to scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Smooth scroll to top when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
};

// Layout component that wraps all pages
const Layout: React.FC = () => {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] transition-colors duration-200">
      <Navbar onAuthClick={() => setShowAuth(true)} />
      {showAuth && <AuthPage onClose={() => setShowAuth(false)} />}
      <main className="container mx-auto px-4 py-8">
        <Outlet context={{ onAuthClick: () => setShowAuth(true) }} />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

// Main page component
const MainPage: React.FC = () => {
  const location = useLocation();
  const [filters, setFilters] = useState<{
    make: string[];
    model: string[];
    priceRange: [number, number];
    mileage: [number, number];
    year: [number, number];
    engineSize: string[];
    transmission: string[];
    drivetrain: string[];
    fuelType: string[];
    bodyType: string[];
    condition: string[];
    customsStatus: string[];
    steeringWheel: string[];
    color: string[];
    generation: string[];
  }>({
    make: [],
    model: [],
    priceRange: [0, 0],
    mileage: [0, 0],
    year: [0, 0],
    engineSize: [],
    transmission: [],
    drivetrain: [],
    fuelType: [],
    bodyType: [],
    condition: [],
    customsStatus: [],
    steeringWheel: [],
    color: [],
    generation: []
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleApplyFilters = () => {
    console.log('Applying filters:', filters);
    // Close mobile menu after applying filters
    setIsMobileMenuOpen(false);
  };

  // Trigger refresh when returning to main page
  useEffect(() => {
    if (location.pathname === '/') {
      setRefreshTrigger(prev => prev + 1);
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Mobile Filter Toggle Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 md:py-3 px-3 md:px-4 rounded-md transition-colors duration-200 font-medium flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {isMobileMenuOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Sidebar - Hidden on mobile when menu is closed */}
      <aside className={`w-full md:w-64 flex-shrink-0 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
        <Sidebar 
          filters={filters}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
        />
      </aside>
      
      <div className="flex-grow">
        <CarList 
          filters={filters}
          onFilterChange={handleFilterChange}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  );
};

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { onAuthClick } = useOutletContext<{ onAuthClick: () => void }>();

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
            You need to be logged in to access this page
          </div>
          <button
            onClick={onAuthClick}
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-md transition-colors duration-200"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MainPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="terms" element={<TermsOfServicePage />} />
          <Route path="cars/:id" element={<CarDetailsPage />} />
          <Route 
            path="sell" 
            element={
              <ProtectedRoute>
                <SellPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; // Force Vercel update Thu Sep 18 00:52:11 EDT 2025
// Force Vercel cache clear Thu Sep 18 00:56:36 EDT 2025
// Force Vercel cache clear Thu Sep 18 00:57:36 EDT 2025
// Force Vercel cache clear Thu Sep 18 00:57:47 EDT 2025
// Force Vercel cache clear Thu Sep 18 01:04:03 EDT 2025
