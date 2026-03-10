import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const API_BASE = "https://invoice-generator-backend-5sfh.onrender.com";

// ✅ FIX 1: Firebase initialized ONCE at the top level — NOT inside a function
// If it's inside the function, it crashes with "app already exists" error
const firebaseConfig = {
  apiKey: "AIzaSyBeXxxMRFdTHR9P08tM_3bUYYXXklxL8NY",
  authDomain: "cubeivoice.firebaseapp.com",
  projectId: "cubeivoice",
  storageBucket: "cubeivoice.firebasestorage.app",
  messagingSenderId: "975769053987",
  appId: "1:975769053987:web:c4701d4a5a73204449ba96",
  measurementId: "G-WSF105CZLY"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

// ✅ FIX 2: Removed getAnalytics — not needed and can throw errors in some environments

export default function Auth({ isLogin }) {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- EMAIL/PASSWORD SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Email and Password are required!");
      return;
    }
    if (!isLogin && !formData.name.trim()) {
      setError("Full Name is required for signup!");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();

      if (response.ok) {
        if (!isLogin) {
          alert("Signup Success! Redirecting to Login...");
          navigate('/login');
        } else {
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/dashboard');
        }
      } else {
        setError(data.error || "Authentication Failed");
      }
    } catch (err) {
      setError("Cannot connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // --- FORGOT PASSWORD ---
  const handleForgotPassword = async () => {
    const email = prompt("Please enter your registered email address:");
    if (!email) return;

    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Password reset link sent to: " + email);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Backend connection failed.");
    }
  };

  // --- GOOGLE SIGN-IN ---
  // ✅ FIX 3: Function is now clean — Firebase objects (auth, provider) come from top-level
  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      // Save user info to localStorage (same shape as email/password login)
      localStorage.setItem('user', JSON.stringify({
        name: googleUser.displayName,
        email: googleUser.email
      }));

      navigate('/dashboard');
    } catch (err) {
      // Common errors:
      // auth/popup-closed-by-user — user closed the popup (not a real error)
      // auth/unauthorized-domain   — add your domain in Firebase Console → Auth → Authorized Domains
      if (err.code === 'auth/popup-closed-by-user') {
        // Silently ignore — user just closed the popup
        return;
      }
      if (err.code === 'auth/unauthorized-domain') {
        setError("Domain not authorized. Add your site to Firebase → Authentication → Authorized Domains.");
        return;
      }
      setError("Google Sign-In failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-blue-950 w-full max-w-md p-8 rounded-2xl shadow-2xl border border-slate-700">
        
        <h2 className="text-3xl font-bold text-white mb-2 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-slate-400 text-center mb-8">
          {isLogin ? 'Sign in to manage your invoices' : 'Start generating professional invoices for free'}
        </p>

        {/* ERROR MESSAGE BOX */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-xl text-sm mb-4 text-center font-bold">
            {error}
          </div>
        )}

        {/* GOOGLE BUTTON */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold flex items-center justify-center gap-3 mb-6 hover:bg-slate-100 transition-all active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" alt="Google" className="w-5" />
          {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-blue-950 px-2 text-slate-500">Or use email</span>
          </div>
        </div>

        {/* THE FORM */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Full Name" 
              required
              className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            required
            className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input 
            type="password" 
            placeholder="Password" 
            required
            className="w-full bg-[#0f172a] border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          {isLogin && (
            <div className="flex justify-end mt-1">
              <button 
                type="button" 
                onClick={handleForgotPassword} 
                className="text-[10px] font-bold text-blue-400 hover:text-white transition-colors uppercase tracking-widest"
              >
                Forgot Password?
              </button>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full ${loading ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 rounded-xl font-bold shadow-lg mt-4 transition-all`}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6 text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link to={isLogin ? "/signup" : "/login"} className="text-blue-400 font-bold hover:underline">
            {isLogin ? 'Sign Up' : 'Log In'}
          </Link>
        </p>
      </div>
    </div>
  );
}