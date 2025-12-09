import React, { useState } from 'react';
import { UserProfile, BucketItem, GameState } from '../types';
import { PARTNER_ICONS, LIFE_EXPECTANCY } from '../constants';
import { CheckCircle2, Circle, Share2, Crown, Zap, Gift, FileText, Percent, Star, Baby, MapPin, ExternalLink } from 'lucide-react';
import DeathClock from './DeathClock';

interface LifeProgressProps {
  userProfile: UserProfile;
  initialItems: BucketItem[];
}

const LifeProgress: React.FC<LifeProgressProps> = ({ userProfile, initialItems }) => {
  const [items, setItems] = useState<BucketItem[]>(initialItems);
  const [gameState, setGameState] = useState<GameState>({
    xp: 0,
    discountCredits: 0,
    badges: []
  });
  const [showConfetti, setShowConfetti] = useState(false);

  const yearsLived = userProfile.age;
  const progressPercent = Math.min(100, Math.max(0, (yearsLived / LIFE_EXPECTANCY) * 100));

  const toggleItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const isCompleting = !item.completed;
    
    setItems(prev => prev.map(i => i.id === id ? { ...i, completed: isCompleting } : i));

    if (isCompleting) {
      // Rewards Logic
      let xpGain = 100;
      if (item.difficulty === 'Medium') xpGain = 200;
      if (item.difficulty === 'Hard') xpGain = 500;
      if (item.difficulty === 'Legendary') xpGain = 1000;

      const discountGain = 2; // 2% discount per item

      setGameState(prev => ({
        ...prev,
        xp: prev.xp + xpGain,
        discountCredits: prev.discountCredits + discountGain,
        badges: (xpGain >= 500 && !prev.badges.includes('Legendary Achiever')) 
          ? [...prev.badges, 'Legendary Achiever'] 
          : prev.badges
      }));
      
      // Trigger simple animation effect
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      // Revert logic (simplified)
      setGameState(prev => ({ ...prev, xp: Math.max(0, prev.xp - 100), discountCredits: Math.max(0, prev.discountCredits - 2) }));
    }
  };

  const completionPercentage = Math.round((items.filter(i => i.completed).length / items.length) * 100);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 pb-24 grid md:grid-cols-3 gap-6">
      
      {/* Left Column: Progress & Stats */}
      <div className="md:col-span-1 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-4">
             <div className="h-14 w-14 rounded-full bg-safewill-navy text-white flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden relative">
               {userProfile.themeImage ? (
                 <img src={userProfile.themeImage} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 userProfile.name.charAt(0)
               )}
             </div>
             <div className="overflow-hidden">
               <h3 className="font-bold text-lg truncate">{userProfile.name}</h3>
               <p className="text-xs text-safewill-teal font-bold uppercase tracking-wide truncate">{userProfile.theme}</p>
             </div>
          </div>
          
          <div className="flex justify-between items-center py-3 border-t border-slate-100">
            <span className="text-sm text-slate-600 flex items-center gap-2"><Zap size={16} className="text-amber-500"/> XP</span>
            <span className="font-bold text-xl">{gameState.xp}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t border-slate-100">
            <span className="text-sm text-slate-600 flex items-center gap-2"><Gift size={16} className="text-safewill-teal"/> Rewards</span>
            <span className="font-bold text-xl text-green-600">{gameState.discountCredits}% Off</span>
          </div>
        </div>
        
        {/* Death Clock Mini Widget */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col items-center">
           <DeathClock age={userProfile.age} compact={false} />
        </div>

        {/* Life Journey Map Visualization */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h4 className="font-bold text-slate-700 mb-6 text-center flex items-center justify-center gap-2">
            <MapPin size={18} /> Your Journey
          </h4>
          
          <div className="relative py-8 px-2">
            {/* The Track */}
            <div className="h-3 w-full bg-slate-100 rounded-full relative overflow-hidden">
               {/* Progress Fill */}
               <div 
                 className="absolute top-0 left-0 h-full bg-gradient-to-r from-safewill-teal to-blue-500 rounded-full transition-all duration-1000"
                 style={{ width: `${progressPercent}%` }}
               />
               
               {/* Texture for the un-lived part */}
               <div className="absolute top-0 right-0 h-full w-full opacity-10" style={{ 
                 backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)',
                 backgroundSize: '10px 10px',
                 left: `${progressPercent}%`
               }}></div>
            </div>

            {/* Start Marker (Birth) */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 -ml-1 flex flex-col items-center group">
               <div className="w-8 h-8 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center z-10 shadow-sm text-slate-400 group-hover:scale-110 transition-transform">
                 <Baby size={16} />
               </div>
               <span className="absolute top-10 text-[10px] font-bold text-slate-400 uppercase">Start</span>
            </div>

            {/* Current Position Marker (You) */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-20"
              style={{ left: `calc(${progressPercent}% - 14px)` }}
            >
               <div className="w-9 h-9 bg-safewill-navy border-2 border-white rounded-full flex items-center justify-center shadow-md text-white animate-pulse-slow">
                 <div className="text-xs font-bold">{userProfile.age}</div>
               </div>
               <div className="absolute -top-8 bg-safewill-navy text-white text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-safewill-navy">
                 You are here
               </div>
            </div>

            {/* End Marker (Goal) - Now Tombstone */}
            <div className="absolute top-1/2 -translate-y-1/2 right-0 -mr-1 flex flex-col items-center group">
               <div className="w-8 h-8 bg-slate-100 border-2 border-slate-300 rounded-full flex items-center justify-center z-10 shadow-sm text-slate-500 group-hover:scale-110 transition-transform">
                 <span className="text-lg leading-none">🪦</span>
               </div>
               <span className="absolute top-10 text-[10px] font-bold text-slate-400 uppercase">Legacy</span>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed">
             You've completed {Math.round(progressPercent)}% of the projected map.<br/>
             <span className="text-safewill-teal font-medium">The best landmarks are yet to come.</span>
          </p>
        </div>

        {/* Executor Call to Action */}
        <div className="bg-gradient-to-br from-indigo-900 to-safewill-navy text-white rounded-2xl p-6 shadow-lg relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <FileText size={100} />
           </div>
           <h4 className="font-bold text-lg mb-2 relative z-10">Safewill Executor</h4>
           <p className="text-sm text-blue-100 mb-4 relative z-10">
             You're busy living. Let us handle the admin when you're done.
           </p>
           <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm relative z-10">
             <Percent size={14} /> 
             {gameState.discountCredits > 0 ? `Apply ${gameState.discountCredits}% Discount` : 'Complete tasks to earn discount'}
           </div>
        </div>
      </div>

      {/* Right Column: Quest List */}
      <div className="md:col-span-2 space-y-4">
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 mb-4 relative">
          {userProfile.themeImage && (
            <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{backgroundImage: `url(${userProfile.themeImage})`}}></div>
          )}
          <div className="p-6 relative z-10">
            <h2 className="text-xl font-serif font-bold text-safewill-navy mb-1">{userProfile.theme}</h2>
            <p className="text-sm text-slate-600 italic">"{userProfile.themeDescription}"</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-slate-700">BucketQuest Log</h2>
          <span className="text-sm font-medium text-slate-500">{completionPercentage}% Done</span>
        </div>

        {/* Progress Bar for Tasks */}
        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-6">
          <div className="bg-safewill-teal h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${completionPercentage}%` }}></div>
        </div>

        {items.map((item) => {
           const Icon = PARTNER_ICONS[item.partnerCategory] || Star;
           return (
             <div 
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`group relative bg-white border rounded-xl p-3 transition-all cursor-pointer overflow-hidden ${
                item.completed 
                  ? 'border-green-200 bg-green-50/30' 
                  : 'border-slate-200 hover:border-safewill-teal hover:shadow-md'
              }`}
             >
               <div className="flex items-center gap-4">
                 <div className={`shrink-0 mt-1 transition-colors ${item.completed ? 'text-green-500' : 'text-slate-300 group-hover:text-safewill-teal'}`}>
                   {item.completed ? <CheckCircle2 size={24} className="fill-green-100" /> : <Circle size={24} />}
                 </div>
                 
                 {/* Thumbnail Image */}
                 <div className="h-16 w-24 bg-slate-100 rounded-lg shrink-0 overflow-hidden relative hidden sm:block">
                   {item.imageUrl ? (
                     <img src={item.imageUrl} alt="" className={`w-full h-full object-cover ${item.completed ? 'grayscale opacity-60' : ''}`} />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-300">
                       <Icon size={20} />
                     </div>
                   )}
                   {item.completed && (
                     <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                       <CheckCircle2 size={20} className="text-white drop-shadow-md" />
                     </div>
                   )}
                 </div>

                 <div className="flex-grow min-w-0">
                   <div className="flex justify-between items-center mb-1">
                     <div className="flex items-center gap-2">
                       <h3 className={`font-bold text-base truncate ${item.completed ? 'text-slate-500 line-through decoration-slate-400' : 'text-slate-800'}`}>
                         {item.title}
                       </h3>
                       {/* Partner Badge */}
                       <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5" title={`Partner: ${item.partnerName}`}>
                          <ExternalLink size={10} className="text-safewill-teal" />
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{item.partnerName}</span>
                       </div>
                     </div>
                     {item.completed && <span className="shrink-0 text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">+XP</span>}
                   </div>
                   
                   <p className={`text-xs truncate ${item.completed ? 'text-slate-400' : 'text-slate-500'}`}>
                     {item.description}
                   </p>
                 </div>
               </div>
             </div>
           );
        })}

        {/* Share Section */}
        <div className="mt-8 bg-safewill-light rounded-xl p-6 text-center border border-blue-100">
          <Crown className="mx-auto text-safewill-navy mb-2" size={32} />
          <h3 className="font-bold text-safewill-navy mb-1">Legacy is more fun together</h3>
          <p className="text-sm text-slate-600 mb-4">Share your BucketQuest and challenge your squad.</p>
          <button className="bg-white text-safewill-navy border border-slate-200 px-6 py-2 rounded-lg font-bold hover:bg-slate-50 transition-colors inline-flex items-center gap-2">
            <Share2 size={16} /> Share My BucketQuest
          </button>
        </div>
      </div>
      
      {/* Global overlay confetti could go here */}
      {showConfetti && (
         <div className="fixed top-10 right-10 z-50 pointer-events-none animate-bounce">
            <div className="bg-safewill-gold text-safewill-navy font-bold px-4 py-2 rounded-lg shadow-xl border-2 border-white">
              Quest Complete! +XP
            </div>
         </div>
      )}
    </div>
  );
};

export default LifeProgress;