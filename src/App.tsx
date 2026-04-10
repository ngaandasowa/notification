import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './firebase';
import { doc, getDocFromServer } from 'firebase/firestore';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { CreatorPage } from './pages/CreatorPage';
import { CardPage } from './pages/CardPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, '_system_', 'connection-test'));
        console.log('Firestore connection test successful');
      } catch (error: any) {
        if (error.message?.includes('the client is offline')) {
          console.error("Firebase configuration error: The client is offline. Please check your Firebase settings.");
        }
      }
    };
    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <div className="flex justify-center py-12"><Auth /></div>} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
            <Route path="/create" element={user ? <CreatorPage /> : <Navigate to="/auth" />} />
            <Route path="/card/:cardId" element={<CardPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}
