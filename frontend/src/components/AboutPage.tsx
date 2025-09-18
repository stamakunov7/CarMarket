import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 dark:from-blue-400/5 dark:to-purple-400/5"></div>
        <div className="relative px-6 py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
            About CarMarket
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Your trusted marketplace for buying and selling quality vehicles. 
            Built with cutting-edge technology to provide the best car trading experience.
          </p>
          <div className="mt-6 flex justify-center space-x-6">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Trusted by 10,000+ users
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              24/7 Support
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Our Mission
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
        </div>
        <p className="text-base text-gray-600 dark:text-gray-300 mb-8 text-center max-w-2xl mx-auto leading-relaxed">
          CarMarket was created to revolutionize the way people buy and sell cars. 
          We believe that finding your perfect vehicle or selling your current one 
          should be simple, transparent, and secure.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="group text-center p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Smart Search</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Advanced filtering and search capabilities to find your perfect car</p>
          </div>
          <div className="group text-center p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg">
            <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fair Pricing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Transparent pricing with no hidden fees or surprises</p>
          </div>
          <div className="group text-center p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">24/7 Support</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Round-the-clock customer support for all your needs</p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-gray-600">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            How CarMarket Works
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-10 h-10 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                For Buyers
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 group">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Browse & Filter</h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">Use our advanced filters to find cars by make, model, price, year, and more</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">View Details</h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">Get comprehensive information about each vehicle including photos and specifications</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Contact Seller</h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">Reach out to sellers directly through our secure messaging system</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 w-10 h-10 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                For Sellers
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 group">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Create Account</h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">Sign up for free and verify your identity for secure transactions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">List Your Car</h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">Upload photos and provide detailed information about your vehicle</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Connect with Buyers</h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">Receive inquiries from interested buyers and negotiate directly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Built with Modern Technology
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="group text-center p-6 border border-gray-200 dark:border-gray-600 rounded-xl hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">React & TypeScript</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Modern frontend with type safety and component-based architecture</p>
          </div>
          <div className="group text-center p-6 border border-gray-200 dark:border-gray-600 rounded-xl hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all duration-300">
            <div className="bg-gradient-to-br from-green-500 to-green-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Node.js & Express</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Robust backend API with RESTful architecture and middleware</p>
          </div>
          <div className="group text-center p-6 border border-gray-200 dark:border-gray-600 rounded-xl hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">PostgreSQL</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Reliable database with ACID compliance and advanced querying</p>
          </div>
          <div className="group text-center p-6 border border-gray-200 dark:border-gray-600 rounded-xl hover:shadow-lg hover:border-red-300 dark:hover:border-red-600 transition-all duration-300">
            <div className="bg-gradient-to-br from-red-500 to-red-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Redis Caching</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">High-performance caching for lightning-fast search results</p>
          </div>
          <div className="group text-center p-6 border border-gray-200 dark:border-gray-600 rounded-xl hover:shadow-lg hover:border-yellow-300 dark:hover:border-yellow-600 transition-all duration-300">
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Cloudinary CDN</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Global image delivery with automatic optimization and resizing</p>
          </div>
          <div className="group text-center p-6 border border-gray-200 dark:border-gray-600 rounded-xl hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">JWT Authentication</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Secure user authentication with token-based sessions</p>
          </div>
        </div>
      </div>

      {/* Developer Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-12">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Created by Temirlan Stamakunov</h2>
          <p className="text-lg mb-6 opacity-90">
            Full-Stack Developer & Car Enthusiast
          </p>
          <div className="max-w-3xl mx-auto">
            <p className="text-base mb-8 opacity-90 leading-relaxed">
              This marketplace was built as a comprehensive demonstration of modern web development practices. 
              Combining passion for cars with cutting-edge technology to create a seamless user experience.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Development Highlights
                </h3>
                <ul className="space-y-3 opacity-90">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Responsive design for all devices
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Advanced search and filtering
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Real-time image uploads
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Secure user authentication
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Performance optimization
                  </li>
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Technical Features
                </h3>
                <ul className="space-y-3 opacity-90">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    TypeScript for type safety
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Redis caching layer
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Database connection pooling
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Error logging & monitoring
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Security best practices
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-600">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Join thousands of satisfied customers who have found their perfect car or sold their vehicle on CarMarket.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center">
                Browse Cars
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link 
              to="/sell" 
              className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center">
                Sell Your Car
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

