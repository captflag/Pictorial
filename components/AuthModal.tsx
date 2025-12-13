import React, { useState } from 'react';
import { userService } from '../services/userService';
import { User } from '../types';
import { X, Mail, User as UserIcon, BookOpen, Loader2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Dummy password for UI
  const [name, setName] = useState('');
  const [cls, setCls] = useState('10');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const user = await userService.login(email);
        onLogin(user);
        onClose();
      } else {
        const user = await userService.signup(name, email, cls);
        onLogin(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100">
            <UserIcon size={32} className="text-brand-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isLogin ? 'Welcome Back' : 'Join Pictorial'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {isLogin ? 'Continue your visual learning journey' : 'Start mastering concepts visually today'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center justify-center">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <div className="relative">
                <UserIcon className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 text-sm"
                />
              </div>
              <div className="relative">
                <BookOpen className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <select 
                  value={cls}
                  onChange={e => setCls(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 text-sm appearance-none"
                >
                  {[6,7,8,9,10,11,12].map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input 
              type="email" 
              placeholder="Email Address"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 text-sm"
            />
          </div>

          <div className="relative">
             {/* Dummy password field for UI completeness */}
             <input 
               type="password" 
               placeholder="Password"
               required
               value={password}
               onChange={e => setPassword(e.target.value)}
               className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 text-sm"
             />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20}/> : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="bg-slate-50 p-4 text-center text-sm border-t border-slate-100">
           <span className="text-slate-500">
             {isLogin ? "Don't have an account? " : "Already have an account? "}
           </span>
           <button 
             onClick={() => { setIsLogin(!isLogin); setError(''); }}
             className="font-bold text-brand-600 hover:text-brand-700"
           >
             {isLogin ? 'Sign Up' : 'Log In'}
           </button>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};