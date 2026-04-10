import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-12">
      <Link to="/" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="space-y-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Terms of Service</h1>
        <p className="text-gray-500">Last updated: April 6, 2026</p>
      </div>

      <div className="prose prose-black max-w-none space-y-6 text-gray-800">
        <section className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-tight">1. Acceptance of Terms</h2>
          <p>
            By accessing or using our services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-tight">2. Use of Services</h2>
          <p>
            You agree to use our services only for lawful purposes and in accordance with these Terms. You are responsible for all content you create and share using our platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-tight">3. User Content</h2>
          <p>
            You retain ownership of all content you create on our platform. However, by using our services, you grant us a non-exclusive, royalty-free license to use, reproduce, and display your content as necessary to provide our services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-tight">4. Prohibited Conduct</h2>
          <p>
            You may not use our services to create or share content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-tight">5. Limitation of Liability</h2>
          <p>
            In no event shall we be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in any way connected with the use of our services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-tight">6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Your continued use of our services after any such changes constitutes your acceptance of the new Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-tight">7. Contact Us</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at +263783827570.
          </p>
        </section>
      </div>
    </div>
  );
};
