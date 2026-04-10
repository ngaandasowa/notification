import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-12">
      <Link to="/" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="space-y-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Privacy Policy</h1>
        <p className="text-gray-500">Last updated: April 6, 2026</p>
      </div>

      <div className="prose prose-black max-w-none space-y-6 text-gray-800">
        <section className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-tight">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you create an account, create notification cards, or contact us for support. This may include your name, email address, and any images or text you upload to our platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-tight">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, to process your transactions, and to communicate with you about your account and our services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-tight">3. Data Storage and Security</h2>
          <p>
            Your data is stored securely using Google Firebase services. We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, or destruction.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-tight">4. Sharing of Information</h2>
          <p>
            We do not share your personal information with third parties except as necessary to provide our services or as required by law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-tight">5. Your Choices</h2>
          <p>
            You can access, update, or delete your account information at any time by logging into your dashboard.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-tight">6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at +263783827570.
          </p>
        </section>
      </div>
    </div>
  );
};
