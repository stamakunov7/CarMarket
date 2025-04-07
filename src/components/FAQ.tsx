import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How can I list my car for sale?",
    answer: "You can list your car by clicking the 'Sell' button, filling out the form, and submitting it for review. Make sure to provide clear photos and detailed information about your vehicle."
  },
  {
    question: "How do I contact a seller?",
    answer: "Click on the 'Request Info' button on the car listing page and send a message directly to the seller. You'll receive a notification when they respond."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, bank transfers, and secure payment platforms. All transactions are protected by our secure payment system."
  },
  {
    question: "How do I schedule a test drive?",
    answer: "Once you've contacted a seller, you can arrange a test drive through our messaging system. We recommend meeting in a public place and bringing a valid driver's license."
  },
  {
    question: "What documents do I need to sell my car?",
    answer: "You'll need your vehicle registration, proof of ownership, service history, and any relevant maintenance records. We'll guide you through the process."
  },
  {
    question: "Is there a warranty on purchased vehicles?",
    answer: "Each vehicle listing includes specific warranty information. Some vehicles come with manufacturer warranties, while others may have dealer warranties or be sold as-is."
  }
];

const FAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { theme } = useTheme();

  const filteredFAQs = faqData.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] transition-colors duration-200">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Find answers to common questions about buying and selling cars
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-200"
              />
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm overflow-hidden
                         transition-all duration-200 hover:shadow-md"
              >
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full px-6 py-4 flex justify-between items-center
                           text-left focus:outline-none"
                >
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    {item.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform duration-200
                             ${openIndex === index ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-200 ease-in-out
                           ${openIndex === index ? 'max-h-96 py-4' : 'max-h-0'}`}
                >
                  <p className="text-gray-600 dark:text-gray-300">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ; 