import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Cars</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400">Used Cars</a></li>
              <li><a href="#" className="hover:text-blue-400">New Cars</a></li>
              <li><a href="#" className="hover:text-blue-400">Compare Cars</a></li>
              <li><a href="#" className="hover:text-blue-400">Car Reviews</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Sell</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400">Sell Your Car</a></li>
              <li><a href="#" className="hover:text-blue-400">Dealer Portal</a></li>
              <li><a href="#" className="hover:text-blue-400">Car Valuation</a></li>
              <li><a href="#" className="hover:text-blue-400">Selling Guide</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400">Contact Us</a></li>
              <li><a href="#" className="hover:text-blue-400">FAQ</a></li>
              <li><a href="#" className="hover:text-blue-400">About Us</a></li>
              <li><a href="#" className="hover:text-blue-400">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <img 
            src={`${process.env.PUBLIC_URL}/logo192.png`} 
            alt="CarMarket Logo" 
            className="h-10 mx-auto mb-4" 
          />
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 