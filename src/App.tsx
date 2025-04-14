import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CarList from './components/CarList';
import Footer from './components/Footer';
import AuthPage from './components/auth/AuthPage';
import FAQ from './components/FAQ';
import SellPage from './components/SellPage';
import SupportPage from './components/SupportPage';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [currentPage, setCurrentPage] = useState<'main' | 'faq' | 'sell' | 'support'>('main');
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

  const handleNavClick = (page: 'main' | 'faq' | 'sell' | 'support') => {
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

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] transition-colors duration-200">
        <Navbar onAuthClick={() => setShowAuth(true)} onNavClick={handleNavClick} />
        {showAuth && <AuthPage onClose={() => setShowAuth(false)} />}
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
                  <CarList />
                </div>
              </div>
            </>
          )}
          {currentPage === 'faq' && <FAQ />}
          {currentPage === 'sell' && <SellPage />}
          {currentPage === 'support' && <SupportPage />}
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default App; 