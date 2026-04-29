import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile as fbUpdateProfile
} from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { UserProfile } from '../../types';
import { LogIn, UserPlus, Fingerprint, ShieldCheck } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (profile: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const currentUser = auth.currentUser;
  const [mode, setMode] = useState<'signin' | 'signup' | 'complete'>(currentUser ? 'complete' : 'signin');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(currentUser?.displayName || '');
  const [role, setRole] = useState<'athlete' | 'coach'>('athlete');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        let uid = currentUser?.uid;
        let finalEmail = email;
        let finalName = name;

        if (mode === 'signup') {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await fbUpdateProfile(cred.user, { displayName: name });
          uid = cred.user.uid;
        } else if (mode === 'complete' && currentUser) {
          uid = currentUser.uid;
          finalEmail = email || currentUser.email || '';
          finalName = name || currentUser.displayName || 'Athlete';
        }

        if (!uid) throw new Error('Authentication session lost.');

        const profile: UserProfile = {
          uid,
          name: finalName,
          email: finalEmail,
          role,
          sport: 'Weightlifting',
          weight: 75,
          palaceId: null
        };
        
        await setDoc(doc(db, 'users', uid), {
          ...profile,
          createdAt: Date.now()
        });
        onAuthSuccess(profile);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      // Profile check is handled by App.tsx, but we could prompt for role/sport here mid-flow 
      // if it's a first-time user. For simplicity, we'll assume they're an athlete.
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-6 py-12 overflow-hidden bg-black">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_50%,rgba(112,0,255,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_20%,rgba(0,242,255,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-repeat bg-[length:32px_32px] opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)' }} />
      </div>

      <div className="absolute font-display text-[clamp(80px,14vw,200px)] font-bold text-white/[0.02] tracking-[20px] pointer-events-none select-none top-1/2 -translate-y-1/2 left-[-2%] whitespace-nowrap z-0">
        IRON PALACE
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="bg-zinc-950/80 backdrop-blur-3xl border border-white/10 p-10 rounded-sm shadow-[0_40px_100px_rgba(0,0,0,0.85)] relative overflow-hidden">
          {/* Top glow line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
          
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl tracking-[0.4em] mb-2 bg-gradient-to-br from-white via-white to-accent bg-clip-text text-transparent">
              {mode === 'complete' ? 'FINALIZE IDENTITY' : 'THE IRON PALACE'}
            </h1>
            <p className="font-mono text-[10px] tracking-[0.3em] text-accent/70 uppercase">
              {mode === 'complete' ? 'Operational Profile Required' : 'Elite Athlete Performance System'}
            </p>
          </div>

          {mode !== 'complete' && (
            <div className="flex border border-white/10 mb-8 rounded-sm overflow-hidden">
              <button 
                onClick={() => setMode('signin')}
                className={`flex-1 py-3 font-mono text-[11px] tracking-widest uppercase transition-colors ${mode === 'signin' ? 'bg-accent text-black font-bold' : 'text-zinc-500 hover:text-white'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setMode('signup')}
                className={`flex-1 py-3 font-mono text-[11px] tracking-widest uppercase transition-colors ${mode === 'signup' ? 'bg-accent text-black font-bold' : 'text-zinc-500 hover:text-white'}`}
              >
                Sign Up
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 font-mono text-[10px] uppercase tracking-wider"
              >
                {error}
              </motion.div>
            )}

            {mode !== 'complete' && (
              <>
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="w-full flex items-center justify-center gap-3 py-3 border border-white/10 hover:border-accent/40 bg-white/5 hover:bg-accent/5 transition-all group"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-mono text-[11px] tracking-widest uppercase group-hover:text-accent transition-colors">Continue with Google</span>
                </button>

                <div className="flex items-center gap-4 text-zinc-700">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="font-mono text-[10px] uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
              </>
            )}

            <div className="space-y-4">
              {(mode === 'signup' || mode === 'complete') && (
                <div className="space-y-1">
                  <label className="font-mono text-[10px] tracking-widest text-accent/60 uppercase ml-1">Display Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-accent/40 focus:bg-accent/5 outline-none px-4 py-3 font-sans text-sm transition-all"
                    placeholder="Subject_001"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-mono text-[10px] tracking-widest text-accent/60 uppercase ml-1">Email Protocol</label>
                <input 
                  type="email" 
                  value={email}
                  disabled={mode === 'complete'}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-accent/40 focus:bg-accent/5 outline-none px-4 py-3 font-sans text-sm transition-all disabled:opacity-50"
                  placeholder="athlete@palace.io"
                />
              </div>

              {mode !== 'complete' && (
                <div className="space-y-1">
                  <label className="font-mono text-[10px] tracking-widest text-accent/60 uppercase ml-1">Access Key</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-accent/40 focus:bg-accent/5 outline-none px-4 py-3 font-sans text-sm transition-all text-accent"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {(mode === 'signup' || mode === 'complete') && (
                <div className="space-y-2">
                  <label className="font-mono text-[10px] tracking-widest text-accent/60 uppercase ml-1">Operational Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('athlete')}
                      className={`flex flex-col items-center gap-2 p-4 border transition-all ${role === 'athlete' ? 'border-accent bg-accent/5 text-accent' : 'border-white/10 bg-white/5 text-zinc-500 hover:border-white/20'}`}
                    >
                      <Fingerprint size={20} />
                      <span className="font-display text-[9px] tracking-[0.2em]">ATHLETE</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('coach')}
                      className={`flex flex-col items-center gap-2 p-4 border transition-all ${role === 'coach' ? 'border-accent bg-accent/5 text-accent' : 'border-white/10 bg-white/5 text-zinc-500 hover:border-white/20'}`}
                    >
                      <ShieldCheck size={20} />
                      <span className="font-display text-[9px] tracking-[0.2em]">COACH</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              disabled={loading}
              className="w-full py-4 bg-accent text-black font-display text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {mode === 'signin' ? <LogIn size={14} /> : <UserPlus size={14} />}
                {loading ? 'Processing...' : mode === 'signin' ? 'Enter the Palace' : 'Forge Identity'}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-[45deg] translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
