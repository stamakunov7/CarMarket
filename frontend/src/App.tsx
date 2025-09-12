import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CarList from './components/CarList';
import Footer from './components/Footer';
import AuthPage from './components/auth/AuthPage';
import FAQ from './components/FAQ';
import SellPage from './components/SellPage';
import SupportPage from './components/SupportPage';
import ProfilePage from './components/ProfilePage';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [currentPage, setCurrentPage] = useState<'main' | 'faq' | 'sell' | 'support' | 'profile'>('main');
  const [pendingSellAccess, setPendingSellAccess] = useState(false);
  const [filters, setFilters] = useState<{
    make: string[];
    model: string[];
    priceRange: [number, number];
    mileage: [number, number];
    year: [number, number];
  }>({
    make: [''],
    model: [''],
    priceRange: [0, 0],
    mileage: [0, 0],
    year: [0, 0]
  });

  const handleNavClick = (page: 'main' | 'faq' | 'sell' | 'support' | 'profile') => {
    // Check if user is trying to access sell page without being logged in
    if (page === 'sell' && !user) {
      setPendingSellAccess(true);
      setShowAuth(true);
      return;
    }
    // Check if user is trying to access profile page without being logged in
    if (page === 'profile' && !user) {
      setShowAuth(true);
      return;
    }
    setCurrentPage(page);
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleApplyFilters = () => {
    console.log('Applying filters:', filters);
  };

  // Auto-redirect to sell page after successful login if user was trying to access it
  useEffect(() => {
    if (user && pendingSellAccess) {
      setCurrentPage('sell');
      setPendingSellAccess(false);
      setShowAuth(false);
    }
  }, [user, pendingSellAccess]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] transition-colors duration-200">
      <Navbar onAuthClick={() => setShowAuth(true)} onNavClick={handleNavClick} />
      {showAuth && <AuthPage onClose={() => {
        setShowAuth(false);
        setPendingSellAccess(false);
      }} />}
      <main className="container mx-auto px-4 py-8">
        {currentPage === 'main' && (
          <>
            <div className="flex flex-col md:flex-row gap-8">
              <aside className="w-full md:w-64 flex-shrink-0">
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
                />
              </div>
            </div>
          </>
        )}
        {currentPage === 'faq' && <FAQ />}
        {currentPage === 'sell' && user && <SellPage />}
        {currentPage === 'sell' && !user && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                You need to be logged in to access the Sell page
              </div>
              <button
                onClick={() => setShowAuth(true)}
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-md transition-colors duration-200"
              >
                Sign In / Register
              </button>
            </div>
          </div>
        )}
        {currentPage === 'support' && <SupportPage />}
        {currentPage === 'profile' && user && <ProfilePage />}
        {currentPage === 'profile' && !user && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                You need to be logged in to access your profile
              </div>
              <button
                onClick={() => setShowAuth(true)}
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-md transition-colors duration-200"
              >
                Sign In / Register
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
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

export default App; 