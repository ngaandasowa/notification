import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { LogIn, Mail, Lock, User as UserIcon, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle redirect result on mount
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setLoading(true);
          const user = result.user;
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
              userId: user.uid,
              name: user.displayName || 'Anonymous',
              email: user.email,
            });
          }
        }
      } catch (err: any) {
        console.error('Redirect result error:', err);
        setError('Something went wrong during sign-in. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    handleRedirect();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
          userId: user.uid,
          name: name || user.displayName || 'Anonymous',
          email: user.email,
        });
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else {
        setError('Authentication failed. Please check your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          userId: user.uid,
          name: user.displayName || 'Anonymous',
          email: user.email,
        });
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        setError('Sign-in was interrupted. Please try the "Alternative Method" below.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('The sign-in window was closed. Please try again.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRedirect = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      console.error('Google Redirect Error:', err);
      setError('Failed to start sign-in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white border border-black rounded-3xl shadow-lg">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-4">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-black">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-gray-500 text-sm">{isLogin ? 'Sign in to continue' : 'Join the community'}</p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {!isLogin && (
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
              required={!isLogin}
            />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
            required
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
            required
          />
        </div>

        {error && (
          <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 space-y-2">
            <p className="text-black text-[10px] font-bold uppercase tracking-widest text-center">{error}</p>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-[9px] text-gray-500 uppercase tracking-tighter font-bold text-center">
                Tip: If popups are blocked, try the alternative method below.
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <span className="relative px-4 bg-white text-gray-400 text-xs uppercase font-bold">Or</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 bg-white border border-gray-200 text-black font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>

        <button
          onClick={handleGoogleRedirect}
          disabled={loading}
          className="w-full mt-2 py-2 bg-gray-50 border border-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-3 h-3" />
          Alternative Method
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-gray-500">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-black font-bold hover:underline"
        >
          {isLogin ? 'Sign Up' : 'Sign In'}
        </button>
      </p>
    </div>
  );
};
