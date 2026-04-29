import React, { useEffect, useState } from 'react';
import { UserProfile, Workout, RecoveryLog, AppState } from '../../types';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Flame, Activity, Trophy, Clock, Target, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DashboardProps {
  profile: UserProfile | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const [stats, setStats] = useState({
    totalVolume: 0,
    totalCalories: 0,
    recoveryScore: 0,
    totalSessions: 0,
    streak: 0
  });
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const fetchData = async () => {
      try {
        const workoutsRef = collection(db, 'users', profile.uid, 'workouts');
        const q = query(workoutsRef, orderBy('ts', 'desc'), limit(5));
        const snap = await getDocs(q).catch(e => handleFirestoreError(e, OperationType.LIST, `users/${profile.uid}/workouts`));
        const ws = snap.docs.map(d => d.data() as Workout);
        setRecentWorkouts(ws);

        // Fetch all for totals (in a real app, use cloud functions/aggregation)
        const allSnap = await getDocs(workoutsRef).catch(e => handleFirestoreError(e, OperationType.LIST, `users/${profile.uid}/workouts`));
        const allWs = allSnap.docs.map(d => d.data() as Workout);
        
        const totalVol = allWs.reduce((s, w) => s + (w.volume || 0), 0);
        const totalCal = allWs.reduce((s, w) => s + (w.calories || 0), 0);

        const recRef = collection(db, 'users', profile.uid, 'recovery');
        const rq = query(recRef, orderBy('ts', 'desc'), limit(1));
        const rSnap = await getDocs(rq).catch(e => handleFirestoreError(e, OperationType.LIST, `users/${profile.uid}/recovery`));
        const lastRec = rSnap.docs[0]?.data() as RecoveryLog;

        setStats({
          totalVolume: totalVol,
          totalCalories: totalCal,
          recoveryScore: lastRec?.score || 0,
          totalSessions: allWs.length,
          streak: 3 // Mock streak for now
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin text-accent"><Target size={32} /></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative overflow-hidden p-8 md:p-12 rounded-sm bg-gradient-to-r from-accent/10 to-transparent border-l-4 border-accent"
      >
        <div className="relative z-10">
          <div className="font-mono text-[10px] tracking-[0.4em] text-accent/70 uppercase mb-2">
            System Protocol Active
          </div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-4 uppercase">
            WELCOME BACK, <span className="text-white/60">{profile?.name?.split(' ')[0] || 'ATHLETE'}</span>
          </h1>
          <div className="flex flex-wrap gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-sm font-mono text-[11px] uppercase tracking-widest text-accent">
              <Flame size={12} className="text-orange-500 fill-orange-500" />
              {stats.streak} Day Streak
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-sm font-mono text-[11px] uppercase tracking-widest text-zinc-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
        {/* Background Decorative Type */}
        <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 font-display text-8xl text-white/[0.02] pointer-events-none select-none uppercase tracking-[1em] whitespace-nowrap">
          PALACE
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume', value: stats.totalVolume.toLocaleString(), unit: 'kg lifted', icon: Zap, color: 'text-accent' },
          { label: 'Calories', value: stats.totalCalories.toLocaleString(), unit: 'kcal burned', icon: Flame, color: 'text-orange-500' },
          { label: 'Recovery', value: stats.recoveryScore > 0 ? stats.recoveryScore + '%' : '—', unit: 'readiness level', icon: Activity, color: 'text-emerald-500' },
          { label: 'Sessions', value: stats.totalSessions, unit: 'total logged', icon: Trophy, color: 'text-white' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white/5 border border-white/5 p-6 md:p-8 rounded-sm hover:border-white/20 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2 group-hover:text-accent transition-colors">
                {stat.label}
              </span>
              <stat.icon size={14} className={stat.color} />
            </div>
            <div className="font-display text-4xl mb-1 tracking-tight">
              {stat.value}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              {stat.unit}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Kinetic Alerts (Global) */}
      <AnimatePresence>
        {stats.recoveryScore > 0 && stats.recoveryScore < 40 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-6 p-6 md:p-8 bg-red-500/5 border border-red-500/20 rounded-sm relative overflow-hidden"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20 shrink-0">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-2 relative z-10">
              <h3 className="font-display text-sm tracking-[0.2em] text-red-500 uppercase font-bold">KINETIC ALERT — PROTECTION PROTOCOL</h3>
              <p className="font-mono text-[10px] text-red-400/80 leading-relaxed uppercase tracking-widest">
                System detection shows high neurological fatigue. Recommendations: Mandatory reduction in compound loading and volume.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secondary Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Workouts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4">
            <span className="h-px flex-1 bg-white/5" />
            <h2 className="font-mono text-[10px] uppercase tracking-[0.5em] text-zinc-500">Recent Operational History</h2>
            <span className="h-px flex-1 bg-white/5" />
          </div>

          <div className="space-y-3">
            {recentWorkouts.length === 0 ? (
              <div className="p-12 border border-dashed border-white/10 rounded-sm flex flex-col items-center gap-4 text-zinc-500">
                <Target size={32} opacity={0.3} />
                <span className="font-mono text-[10px] uppercase tracking-widest text-center">No missions logged in sectors. Start training to see data here.</span>
              </div>
            ) : (
              recentWorkouts.map((w) => (
                <div key={w.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-sm hover:border-accent/20 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-10 h-10 flex items-center justify-center rounded-sm",
                      w.type.includes('Cardio') ? "bg-purple-500/10 text-purple-500" : "bg-accent/10 text-accent"
                    )}>
                      {w.type.includes('Cardio') ? <Activity size={18} /> : <Zap size={18} />}
                    </div>
                    <div>
                      <div className="font-mono text-sm tracking-tight group-hover:text-white transition-colors">{w.type} — {w.muscle}</div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mt-0.5">
                        {w.dateLabel} · {(w.duration / 60).toFixed(0)} min · {w.calories} kcal
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg tracking-tight">{w.volume ? w.volume + 'kg' : '—'}</div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Volume</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PRs or Goals */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="h-px flex-1 bg-white/5" />
            <h2 className="font-mono text-[10px] uppercase tracking-[0.5em] text-zinc-500">Top Records</h2>
            <span className="h-px flex-1 bg-white/5" />
          </div>

          <div className="bg-white/5 border border-white/5 p-6 rounded-sm space-y-6">
            {Object.keys(profile?.uid ? {} : {}).length === 0 ? (
               <div className="text-center py-6">
                 <Trophy size={32} className="mx-auto text-zinc-800 mb-4" />
                 <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">Forge records in training sectors to unlock legacy data.</p>
               </div>
            ) : null}
            {/* Real PR data would map here */}
          </div>
        </div>
      </div>
    </div>
  );
};
