import React, { useState, useEffect } from 'react';
import { UserProfile, RecoveryLog, Biometric } from '../../types';
import { collection, addDoc, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'motion/react';
import { Activity, Apple, Smartphone, Watch, CloudLightning, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RecoveryProps {
  profile: UserProfile | null;
}

export const Recovery: React.FC<RecoveryProps> = ({ profile }) => {
  const [syncing, setSyncing] = useState<string | null>(null);
  const [biometrics, setBiometrics] = useState<Biometric[]>([]);
  const [loading, setLoading] = useState(true);
  const [recoveryLog, setRecoveryLog] = useState<Partial<RecoveryLog>>({
    sleep: 8,
    soreness: 3,
    energy: 7,
    hydration: 3,
    mood: 'Good'
  });

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      // Mock biometrics for now, in real app fetch from 'biometrics' subcollection
      setBiometrics([
        { source: 'apple', hrv: 64, rhr: 52, sleepCycles: 5.2, fetchedAt: Date.now() - 3600000 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const syncDevice = (id: string) => {
    setSyncing(id);
    setTimeout(() => {
      setSyncing(null);
      // Update biometrics...
    }, 2000);
  };

  const calculateRecoveryScore = () => {
    const { sleep = 8, soreness = 3, energy = 7, hydration = 3 } = recoveryLog;
    let score = 50 + (sleep - 6) * 8 - soreness * 4 + (energy - 5) * 5 + (hydration - 2) * 4;
    return Math.min(100, Math.max(15, Math.round(score)));
  };

  const score = calculateRecoveryScore();
  const circ = 2 * Math.PI * 80;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="font-display text-4xl tracking-tight uppercase">RECOVERY</h1>
        <p className="font-mono text-[10px] tracking-[0.3em] text-zinc-500 uppercase mt-1">Biometric Restoration Monitor</p>
      </div>

      {/* Device Sync Row */}
      <div className="bg-white/5 border border-white/5 p-8 rounded-sm">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent/70 flex items-center gap-3 mb-8">
          <CloudLightning size={14} /> Silent Tracker — Peripheral Integration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'apple', name: 'Apple Health', icon: Apple },
            { id: 'google', name: 'Google Fit', icon: Smartphone },
            { id: 'whoop', name: 'Whoop 4.0', icon: Watch },
          ].map((device) => (
            <button
              key={device.id}
              onClick={() => syncDevice(device.id)}
              disabled={!!syncing}
              className={cn(
                "flex flex-col items-center gap-4 p-8 border border-white/5 bg-zinc-950 transition-all group",
                syncing === device.id ? "animate-pulse border-accent/40" : "hover:border-white/20"
              )}
            >
              <div className={cn(
                "w-12 h-12 flex items-center justify-center rounded-full transition-all",
                syncing === device.id ? "bg-accent text-black scale-110" : "bg-white/5 text-zinc-500 group-hover:text-white"
              )}>
                <device.icon size={24} />
              </div>
              <div className="text-center">
                <div className="font-mono text-[10px] uppercase tracking-widest">{device.name}</div>
                <div className="font-mono text-[8px] uppercase tracking-widest text-zinc-600 mt-1">
                  {syncing === device.id ? 'Syncing System...' : 'Tap to Initiate'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Ring */}
        <div className="bg-white/5 border border-white/5 p-10 rounded-sm flex flex-col items-center justify-center space-y-8">
          <div className="relative">
            <svg className="w-64 h-64 -rotate-90">
              <circle 
                cx="128" cy="128" r="80" 
                className="fill-none stroke-white/5 stroke-[12]" 
              />
              <motion.circle 
                cx="128" cy="128" r="80" 
                className="fill-none stroke-accent stroke-[12] stroke-linecap-round" 
                initial={{ strokeDasharray: circ, strokeDashoffset: circ }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ strokeDasharray: circ }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-display text-6xl text-white font-bold">{score}%</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-2">Readiness</div>
            </div>
          </div>

          <div className="w-full space-y-4">
             <div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-sm">
                <Info size={16} className="text-emerald-500 shrink-0" />
                <p className="font-sans text-xs text-emerald-500/80 leading-relaxed">
                  System optimal. Central Nervous System shows high adaptability. Priority mission parameters: Core compound movements.
                </p>
             </div>
          </div>
        </div>

        {/* Sliders for manual entry */}
        <div className="bg-white/5 border border-white/10 p-10 rounded-sm space-y-10">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent/70">Bio-Metric Calibration</h3>
          
          <div className="space-y-8">
            {[
              { id: 'sleep', label: 'Sleep Quality', unit: 'hrs', min: 0, max: 24, step: 0.5 },
              { id: 'soreness', label: 'Muscle Soreness', unit: 'scale', min: 1, max: 10, step: 1 },
              { id: 'energy', label: 'Energy Level', unit: 'scale', min: 1, max: 10, step: 1 },
              { id: 'hydration', label: 'Water Intake', unit: 'liters', min: 0, max: 10, step: 0.5 },
            ].map((field) => (
              <div key={field.id} className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">{field.label}</label>
                  <div className="font-display text-xl text-accent">
                    {recoveryLog[field.id as keyof RecoveryLog]} <span className="text-[10px] text-zinc-600 ml-1">{field.unit}</span>
                  </div>
                </div>
                <input 
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={recoveryLog[field.id as keyof RecoveryLog] || 0}
                  onChange={(e) => setRecoveryLog({ ...recoveryLog, [field.id]: parseFloat(e.target.value) })}
                  className="w-full accent-accent bg-white/5 h-1 appearance-none cursor-pointer"
                />
              </div>
            ))}
          </div>

          <button
            className="w-full py-4 bg-accent text-black font-display text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-white transition-all shadow-[0_20px_40px_rgba(0,242,255,0.15)] mt-4"
          >
            Update Restoration State
          </button>
        </div>
      </div>
    </div>
  );
};
