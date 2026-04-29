import React, { useState } from 'react';
import { AnatomyModel } from '../visuals/AnatomyModel';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, MessageSquare, AlertCircle, ChevronRight, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

const INJURIES_DATA: Record<string, any> = {
  head: { 
    name: 'Concussion', 
    category: 'serious',
    risk: 'High', 
    desc: 'Traumatic brain injury caused by impact. Symptoms include dizziness and memory loss.', 
    solution: 'Immediate cessation of activity, darkened room, medical clearance.' 
  },
  neck: {
    name: 'Cervical Strain',
    category: 'common',
    risk: 'Low',
    desc: 'Stretching or tearing of neck muscles/tendons.',
    solution: 'Gentle mobility, heat therapy, ergonomic adjustments.'
  },
  shoulder: { 
    name: 'Rotator Cuff Tear', 
    category: 'rare',
    risk: 'Medium', 
    desc: 'Partial or full tear of the tendons anchoring the shoulder joint.', 
    solution: 'Physical therapy focus on scapular stability, possible surgery.' 
  },
  back: {
    name: 'Lumbar Strain',
    category: 'common',
    risk: 'Medium',
    desc: 'Lower back muscle strain from improper lifting form.',
    solution: 'Core strengthening, feline-camel stretches, load management.'
  },
  elbow: {
    name: 'Lateral Epicondylitis',
    category: 'common',
    risk: 'Low',
    desc: 'Tennis elbow; overuse of forearm extensor muscles.',
    solution: 'Rest, eccentric loading exercises, bracing.'
  },
  wrist: {
    name: 'Carpal Tunnel',
    category: 'rare',
    risk: 'Low',
    desc: 'Compression of the median nerve at the wrist.',
    solution: 'Night splinting, nerve gliding exercises, workstation audit.'
  },
  hip: {
    name: 'Hip Labral Tear',
    category: 'rare',
    risk: 'Medium',
    desc: 'Tearing of the cartilage ring surrounding the hip socket.',
    solution: 'Glute activation, avoiding deep flexion, arthroscopy.'
  },
  knee: { 
    name: 'ACL Rupture', 
    category: 'serious',
    risk: 'High', 
    desc: 'Complete snap of the Anterior Cruciate Ligament.', 
    solution: 'Surgical reconstruction, 9-12 month rehabilitation protocol.' 
  },
  ankle: {
    name: 'Inversion Sprain',
    category: 'common',
    risk: 'Low',
    desc: 'Rolling the ankle outwards, damaging lateral ligaments.',
    solution: 'Proprioception training, balance board work, compression.'
  }
};

export const Injuries: React.FC = () => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [tab, setTab] = useState<'common' | 'rare' | 'serious'>('common');

  const filteredInjuries = Object.entries(INJURIES_DATA).filter(([_, data]) => data.category === tab);

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="font-display text-5xl tracking-tight uppercase font-bold">INJURIES</h1>
        <p className="font-mono text-[10px] tracking-[0.4em] text-zinc-500 uppercase mt-2">Trauma Classification & Response</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Common Issues', count: 12, color: 'text-white' },
          { label: 'Rare Pathologies', count: 4, color: 'text-violet-400' },
          { label: 'Critical Traumas', count: 2, color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-sm">
            <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mb-1">{stat.label}</div>
            <div className={cn("font-display text-3xl font-bold", stat.color)}>{stat.count}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Model & Tabs */}
        <div className="lg:col-span-5 space-y-8">
          <div className="flex bg-white/5 p-1 rounded-sm border border-white/5">
            {['common', 'rare', 'serious'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t as any)}
                className={cn(
                  "flex-1 py-3 font-display text-[10px] uppercase tracking-[0.2em] transition-all rounded-sm",
                  tab === t ? "bg-white text-black font-bold shadow-xl" : "text-zinc-500 hover:text-white"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="aspect-[3/4] w-full max-w-sm mx-auto overflow-hidden rounded-sm border border-white/5 bg-zinc-950/50 relative">
             <AnatomyModel 
               selectedPart={selectedPart}
               onSelect={setSelectedPart}
               intensityMap={Object.fromEntries(filteredInjuries.map(([k]) => [k, tab === 'serious' ? 8 : tab === 'rare' ? 5 : 2]))}
               className="w-full h-full border-none rounded-none bg-transparent"
             />
          </div>

          {/* Quick List for Tab */}
          <div className="space-y-3">
            <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-4 px-2">Identified Sectors ({tab})</h4>
            <div className="grid grid-cols-2 gap-2">
              {filteredInjuries.map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPart(key)}
                  className={cn(
                    "px-4 py-3 border text-left transition-all rounded-sm group",
                    selectedPart === key ? "bg-accent/10 border-accent text-accent" : "bg-white/5 border-white/5 text-zinc-400 hover:border-white/20"
                  )}
                >
                  <div className="font-display text-[10px] uppercase tracking-widest font-bold group-hover:translate-x-1 transition-transform">{data.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!selectedPart ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/5 border border-white/5 rounded-sm"
              >
                <AlertCircle size={40} className="text-zinc-800 mb-6" />
                <h3 className="font-display text-sm tracking-[0.2em] mb-2 uppercase text-zinc-400 text-center">Select Body Sector</h3>
                <p className="font-mono text-[10px] text-zinc-600 max-w-xs mx-auto uppercase tracking-widest">Interactive scan ready. Hover or tap target anatomy to begin trauma assessment.</p>
              </motion.div>
            ) : (
              <motion.div 
                key={selectedPart}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-10 p-10 bg-white/5 border border-white/5 rounded-sm h-full"
              >
                <div>
                  <div className="font-mono text-[10px] tracking-[0.4em] text-accent uppercase mb-2">Protocol: Assessment</div>
                  <h2 className="font-display text-4xl uppercase tracking-tighter">{INJURIES_DATA[selectedPart]?.name || selectedPart.toUpperCase()}</h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Risk Profile</div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-24 bg-white/5 overflow-hidden">
                        <div className={cn("h-full", INJURIES_DATA[selectedPart]?.risk === 'High' ? 'bg-red-500 w-full' : 'bg-orange-500 w-1/2')} />
                      </div>
                      <span className="font-mono text-[10px] uppercase text-white">{INJURIES_DATA[selectedPart]?.risk || 'Standard'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Pathology</div>
                    <p className="font-sans text-sm text-zinc-400 leading-relaxed italic">
                      "{INJURIES_DATA[selectedPart]?.desc || 'Standard articular or muscular strain detected. Protocol indicates rest and realignment.'}"
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-2">Remedies</div>
                    <div className="space-y-3">
                      {[
                        INJURIES_DATA[selectedPart]?.solution || 'Standard RICE Protocol',
                        'Physiotherapeutic Realignment',
                        'Neuromuscular Activation Drills'
                      ].map((s, i) => (
                        <div key={i} className="flex items-center gap-3 text-emerald-500/80">
                          <ChevronRight size={14} />
                          <span className="font-mono text-[10px] uppercase tracking-widest">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button className="w-full py-4 border border-accent/30 text-accent font-display text-[10px] tracking-[0.3em] uppercase hover:bg-accent hover:text-black transition-all">
                    Initiate Rehabilitation Plan
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
