import React, { useState, useEffect } from 'react';
import { UserProfile, PalaceMember, AppState } from '../../types';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, AlertCircle, TrendingUp, User as UserIcon, ChevronRight, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LegionProps {
  profile: UserProfile | null;
}

interface AthleteData extends PalaceMember {
  readiness: number;
  recentVolume: number;
  alerts: number;
}

export const Legion: React.FC<LegionProps> = ({ profile }) => {
  const [athletes, setAthletes] = useState<AthleteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAthlete, setSelectedAthlete] = useState<string | null>(null);

  useEffect(() => {
    fetchLegion();
  }, [profile]);

  const fetchLegion = async () => {
    if (!profile || profile.role !== 'coach') return;
    setLoading(true);
    try {
      const q = query(collection(db, 'palaces'), where('coachUid', '==', profile.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const palaceData = snap.docs[0].data();
        const members = palaceData.members as PalaceMember[];
        
        // In a real app, you'd fetch readiness scores for all members here.
        // For now, we'll mock some data based on the member list.
        const mockAthletes = members.map(m => ({
          ...m,
          readiness: Math.floor(Math.random() * 40) + 60, // 60-100
          recentVolume: Math.floor(Math.random() * 10000) + 5000,
          alerts: Math.random() > 0.8 ? 1 : 0
        }));
        
        setAthletes(mockAthletes);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl tracking-tight uppercase tracking-widest text-white flex items-center gap-4">
             THE LEGION
          </h1>
          <p className="font-mono text-[10px] tracking-[0.3em] text-zinc-500 uppercase mt-1">Operational Readiness Matrix</p>
        </div>
        <div className="flex gap-4">
           {[
             { label: 'Tactical', count: athletes.length },
             { label: 'Critical', count: athletes.filter(a => a.readiness < 70).length, color: 'text-red-500' }
           ].map(stat => (
             <div key={stat.label} className="px-5 py-2 bg-white/5 border border-white/10 rounded-sm flex items-center gap-3">
                <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">{stat.label}</span>
                <span className={cn("font-display text-lg", stat.color || "text-accent")}>{stat.count}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Heatmap/List Side */}
        <div className="lg:col-span-12 space-y-4">
           {athletes.length === 0 ? (
             <div className="py-32 border border-dashed border-white/5 rounded-sm flex flex-col items-center justify-center text-zinc-600">
                <Swords size={48} className="mb-6 opacity-20" />
                <span className="font-mono text-[10px] uppercase tracking-widest">No entities linked to command sector.</span>
             </div>
           ) : (
             <div className="space-y-3">
               {athletes.sort((a,b) => a.readiness - b.readiness).map((a) => (
                 <motion.div 
                   key={a.uid}
                   className={cn(
                     "group relative flex items-center justify-between p-6 bg-zinc-950 border border-white/5 rounded-sm cursor-pointer transition-all hover:border-white/20",
                     a.readiness < 70 ? "border-l-4 border-l-red-500" : "border-l-4 border-l-emerald-500"
                   )}
                 >
                    <div className="flex items-center gap-8">
                       <div className="relative">
                          <div className="w-14 h-14 bg-white/5 flex items-center justify-center rounded-xs font-display text-sm group-hover:bg-accent/10 transition-colors">
                            {a.name[0]}
                          </div>
                          {a.alerts > 0 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-zinc-950 animate-pulse" />
                          )}
                       </div>

                       <div className="space-y-1">
                          <div className="font-display text-sm tracking-widest uppercase text-white group-hover:text-accent transition-colors">{a.name}</div>
                          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">{a.sport} · Sector Gamma</div>
                       </div>
                    </div>

                    <div className="flex items-center gap-12 text-right">
                       <div className="hidden md:block">
                          <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">Recent Activity</div>
                          <div className="font-display text-lg tracking-tighter text-white/40">{a.recentVolume.toLocaleString()} <span className="text-[10px]">kg</span></div>
                       </div>
                       
                       <div>
                          <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mb-1">Status</div>
                          <div className={cn(
                            "font-display text-3xl tabular-nums tracking-tighter",
                            a.readiness >= 85 ? "text-emerald-400" : a.readiness >= 70 ? "text-white" : "text-red-500 animate-pulse"
                          )}>
                            {a.readiness}%
                          </div>
                       </div>

                       <ChevronRight size={20} className="text-zinc-800 group-hover:text-accent transition-all translate-x-0 group-hover:translate-x-1" />
                    </div>
                 </motion.div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
