import React, { useState } from 'react';
import { X, Lock, User, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { ApiService, UserProfile } from '../../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  backendOnline: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  backendOnline,
}) => {
  const [username, setUsername] = useState('owner');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (backendOnline) {
        const res = await ApiService.login(username, password);
        onLoginSuccess(res.user);
        onClose();
      } else {
        // Offline demo login fallback
        const mockUser: UserProfile = {
          id: username === 'owner' ? 1 : 2,
          username,
          full_name: username === 'owner' ? 'Farm Owner / Administrator' : 'Flock Supervisor',
          role: username === 'owner' ? 'Owner' : 'Supervisor',
        };
        ApiService.setStoredUser(mockUser);
        onLoginSuccess(mockUser);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-farm-800 to-farm-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5 text-farm-200" />
            </div>
            <div>
              <h3 className="text-base font-bold">Poultry Farm Portal Sign-in</h3>
              <p className="text-xs text-farm-100">Role-based Access & Security</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-farm-600 focus:border-farm-600 bg-slate-50 focus:bg-white"
                placeholder="Enter username (e.g. owner)"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-farm-600 focus:border-farm-600 bg-slate-50 focus:bg-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Quick presets for testing */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Quick Test Credentials
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('owner', 'admin123')}
                className="text-left p-2 rounded-lg border border-slate-200 hover:border-farm-500 hover:bg-farm-50/50 transition-colors"
              >
                <div className="text-xs font-bold text-slate-800">Owner</div>
                <div className="text-[10px] text-slate-500 font-mono">owner / admin123</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('supervisor', 'super123')}
                className="text-left p-2 rounded-lg border border-slate-200 hover:border-farm-500 hover:bg-farm-50/50 transition-colors"
              >
                <div className="text-xs font-bold text-slate-800">Supervisor</div>
                <div className="text-[10px] text-slate-500 font-mono">supervisor / super123</div>
              </button>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-farm-700 hover:bg-farm-800 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
