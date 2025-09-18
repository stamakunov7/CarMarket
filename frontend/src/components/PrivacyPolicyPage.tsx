import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto pt-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Privacy Policy
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Introduction</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              At CarMarket, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
              car marketplace platform.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              By using our service, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Personal Information</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
              <li>Name and contact information (email address, phone number)</li>
              <li>Account credentials (username, password)</li>
              <li>Profile information and preferences</li>
              <li>Payment information (processed securely through third-party providers)</li>
              <li>Communication records with our support team</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Vehicle Information</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
              <li>Vehicle details (make, model, year, mileage, condition)</li>
              <li>Vehicle images and descriptions</li>
              <li>Location information for vehicle listings</li>
              <li>Vehicle history and documentation</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Usage Information</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
              <li>Website usage patterns and preferences</li>
              <li>Search queries and filter selections</li>
              <li>Device information and browser type</li>
              <li>IP address and location data</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>To provide and maintain our car marketplace service</li>
              <li>To process transactions and facilitate car sales</li>
              <li>To communicate with you about your account and listings</li>
              <li>To improve our platform and develop new features</li>
              <li>To provide customer support and respond to inquiries</li>
              <li>To send you important updates and notifications</li>
              <li>To prevent fraud and ensure platform security</li>
              <li>To comply with legal obligations and enforce our terms</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Information Sharing and Disclosure</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li><strong>With other users:</strong> Vehicle listings and seller contact information (with your consent)</li>
              <li><strong>Service providers:</strong> Trusted third parties who assist in operating our platform</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
              <li><strong>Consent:</strong> When you explicitly consent to sharing your information</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Data Security</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication systems</li>
              <li>Secure data storage and backup procedures</li>
              <li>Employee training on data protection practices</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Rights and Choices</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              You have certain rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Receive a copy of your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cookies and Tracking Technologies</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your experience on our platform. These technologies help us:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>Remember your preferences and settings</li>
              <li>Analyze website traffic and usage patterns</li>
              <li>Provide personalized content and recommendations</li>
              <li>Improve platform performance and functionality</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
              You can control cookie settings through your browser preferences, though this may affect platform functionality.
            </p>
          </section>

          {/* Third-Party Services */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Third-Party Services</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              Our platform may integrate with third-party services for payment processing, image hosting, and analytics. 
              These services have their own privacy policies, and we encourage you to review them.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We are not responsible for the privacy practices of these third-party services.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Children's Privacy</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal 
              information from children under 13. If you are a parent or guardian and believe your child has provided 
              us with personal information, please contact us immediately.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
              new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this 
              Privacy Policy periodically for any changes.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
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

export default PrivacyPolicyPage;
