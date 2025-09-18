import React from 'react';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto pt-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Terms of Service
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 md:p-12">
        <div className="prose prose-lg max-w-none dark:prose-invert">
          
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Agreement to Terms</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              These Terms of Service ("Terms") govern your use of the CarMarket platform ("Service") operated by 
              CarMarket ("us", "we", or "our"). By accessing or using our Service, you agree to be bound by these Terms.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              If you disagree with any part of these terms, then you may not access the Service.
            </p>
          </section>

          {/* Service Description */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Service Description</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              CarMarket is an online marketplace that connects car buyers and sellers. Our platform allows users to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>Browse and search for vehicles</li>
              <li>Create and manage vehicle listings</li>
              <li>Communicate with other users</li>
              <li>Access vehicle information and specifications</li>
              <li>Use various tools and features to facilitate car transactions</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Accounts</h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Account Creation</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              To use certain features of our Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mb-6">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Account Termination</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation of these Terms 
              or for any other reason at our sole discretion.
            </p>
          </section>

          {/* User Responsibilities */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Responsibilities</h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Prohibited Activities</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              You agree not to use the Service for any unlawful or prohibited activities, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mb-6">
              <li>Posting false, misleading, or fraudulent information</li>
              <li>Violating any applicable laws or regulations</li>
              <li>Infringing on intellectual property rights</li>
              <li>Harassing, threatening, or abusing other users</li>
              <li>Attempting to gain unauthorized access to the Service</li>
              <li>Using automated systems to access the Service without permission</li>
              <li>Spamming or sending unsolicited communications</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Content Guidelines</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              When posting content on our platform, you must ensure that:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>All information is accurate and truthful</li>
              <li>Images are of good quality and represent the actual vehicle</li>
              <li>Content does not violate any third-party rights</li>
              <li>Content is appropriate and not offensive</li>
            </ul>
          </section>

          {/* Vehicle Listings */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Vehicle Listings</h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Seller Responsibilities</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              As a seller, you are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mb-6">
              <li>Providing accurate and complete vehicle information</li>
              <li>Ensuring the vehicle is legally available for sale</li>
              <li>Maintaining the accuracy of your listing</li>
              <li>Responding to inquiries in a timely manner</li>
              <li>Completing transactions in good faith</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Buyer Responsibilities</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              As a buyer, you are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>Conducting your own due diligence before purchasing</li>
              <li>Verifying vehicle condition and history</li>
              <li>Ensuring you have the legal right to purchase the vehicle</li>
              <li>Completing transactions in good faith</li>
            </ul>
          </section>

          {/* Transactions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Transactions and Payments</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              CarMarket facilitates connections between buyers and sellers but is not a party to vehicle transactions. 
              We do not:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mb-6">
              <li>Guarantee the condition or authenticity of vehicles</li>
              <li>Process payments for vehicle purchases</li>
              <li>Provide warranties or guarantees for transactions</li>
              <li>Mediate disputes between buyers and sellers</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              All transactions are between the buyer and seller directly. We recommend using secure payment methods 
              and conducting thorough inspections before completing any purchase.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Intellectual Property</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              The Service and its original content, features, and functionality are owned by CarMarket and are 
              protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              You retain ownership of content you post on our platform, but grant us a license to use, display, 
              and distribute such content in connection with the Service.
            </p>
          </section>

          {/* Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Privacy</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of 
              the Service, to understand our practices regarding the collection and use of your information.
            </p>
          </section>

          {/* Disclaimers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Disclaimers</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations or 
              warranties of any kind, express or implied, regarding the Service, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>The accuracy, reliability, or completeness of any information</li>
              <li>The quality or condition of vehicles listed on the platform</li>
              <li>The availability or uninterrupted operation of the Service</li>
              <li>The security of the Service or your data</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              In no event shall CarMarket, its directors, employees, partners, agents, suppliers, or affiliates 
              be liable for any indirect, incidental, special, consequential, or punitive damages, including without 
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use 
              of the Service.
            </p>
          </section>

          {/* Indemnification */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Indemnification</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              You agree to defend, indemnify, and hold harmless CarMarket and its licensee and licensors, and their 
              employees, contractors, agents, officers and directors, from and against any and all claims, damages, 
              obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees).
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Governing Law</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              These Terms shall be interpreted and governed by the laws of the State of California, without regard 
              to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will 
              not be considered a waiver of those rights.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Changes to Terms</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a 
              revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>Email:</strong> tstamakunov@stetson.edu
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Phone:</strong> +1 (386) 343-1643
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
