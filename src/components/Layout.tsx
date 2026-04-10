import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Bell, LogOut, User as UserIcon, Plus } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase">Notification</span>
            </Link>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    to="/create"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Card
                  </Link>
                  <Link
                    to="/dashboard"
                    className="p-2 text-gray-500 hover:text-black transition-colors"
                    title="Dashboard"
                  >
                    <UserIcon className="w-6 h-6" />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-500 hover:text-black transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="px-6 py-2 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-16rem)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-black tracking-tighter uppercase">Notification</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The ultimate platform for creating and sharing viral notification-style cards. 
                Designed for maximum engagement on social media.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Platform</h4>
              <ul className="space-y-2 text-sm font-bold">
                <li><Link to="/" className="hover:text-gray-400 transition-colors">Home</Link></li>
                <li><Link to="/dashboard" className="hover:text-gray-400 transition-colors">Dashboard</Link></li>
                <li><Link to="/create" className="hover:text-gray-400 transition-colors">Create Card</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Legal & Support</h4>
              <ul className="space-y-2 text-sm font-bold">
                <li><Link to="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link></li>
                <li className="text-gray-400 pt-2">
                  <span className="block text-[10px] uppercase tracking-widest text-gray-600 mb-1">Developer</span>
                  Ngaavongwe Ndasowampange
                </li>
                <li className="text-gray-400">
                  <span className="block text-[10px] uppercase tracking-widest text-gray-600 mb-1">Contact</span>
                  +263783827570
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              © 2026 Notification. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                Made in Zimbabwe
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation (Floating Action Button) */}
      {user && (
        <Link
          to="/create"
          className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl z-50 active:scale-90 transition-transform"
        >
          <Plus className="w-8 h-8" />
        </Link>
      )}
    </div>
  );
};
