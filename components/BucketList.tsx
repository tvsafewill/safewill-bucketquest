import React from 'react';
import { BucketItem, UserProfile } from '../types';
import { PARTNER_ICONS, LIFE_EXPECTANCY } from '../constants';
import { ArrowRight, Star, ExternalLink, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import DeathClock from './DeathClock';

interface BucketListProps {
  userProfile: UserProfile;
  items: BucketItem[];
  isLoading: boolean;
  onAccept: () => void;
}

const BucketList: React.FC<BucketListProps> = ({ userProfile, items, isLoading, onAccept }) => {
  const yearsLeft = Math.max(0, LIFE_EXPECTANCY - userProfile.age);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <Loader2 size={64} className="text-safewill-teal animate-spin mb-6" />
        <h2 className="text-2xl font-serif font-bold text-safewill-navy mb-2">Visualizing Your Future...</h2>
        <p className="text-slate-500 max-w-md">We're painting the picture of your {userProfile.theme || "future"} life based on your "{userProfile.vibe}" vibe.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-50 w-full max-w-2xl">
           <div className="h-40 bg-slate-200 rounded-xl animate-pulse w-full"></div>
           <div className="h-40 bg-slate-200 rounded-xl animate-pulse w-full" style={{animationDelay: '0.2s'}}></div>
           <div className="h-40 bg-slate-200 rounded-xl animate-pulse w-full" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
      {/* Header / Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 relative text-white rounded-2xl shadow-lg overflow-hidden min-h-[220px] group">
          {/* Background Image */}
          {userProfile.themeImage ? (
             <div 
               className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
               style={{ backgroundImage: `url(${userProfile.themeImage})` }}
             />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-safewill-navy to-safewill-blue" />
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 flex flex-col justify-end">
             <div className="flex items-center gap-2 mb-2 text-safewill-gold font-bold uppercase tracking-wider text-xs shadow-black drop-shadow-md">
               <Sparkles size={14} /> AI Generated Persona
             </div>
             <h2 className="text-3xl font-serif font-bold mb-2 text-white shadow-black drop-shadow-md">{userProfile.theme}</h2>
             <p className="text-white/90 text-lg italic leading-relaxed drop-shadow-md">
                "{userProfile.themeDescription}"
             </p>
          </div>
        </div>
        
        {/* Death Clock Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
          <DeathClock age={userProfile.age} />
        </div>
      </div>

      {/* List */}
      <div className="space-y-6">
        {items.map((item, index) => {
          const Icon = PARTNER_ICONS[item.partnerCategory] || Star;
          return (
            <div 
              key={item.id} 
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col md:flex-row group"
              style={{ animation: `fadeIn 0.5s ease-out ${index * 0.1}s backwards` }}
            >
              {/* Item Image */}
              <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden bg-slate-100">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon size={32} />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm text-safewill-navy">
                  <Icon size={20} />
                </div>
              </div>

              {/* Content */}
              <div className="p-5 md:w-2/3 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-slate-800">{item.title}</h3>
                         {/* Partner Badge */}
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-2 py-0.5">
                            <ExternalLink size={12} className="text-safewill-teal" />
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{item.partnerName}</span>
                        </div>
                    </div>
                    
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${
                       item.difficulty === 'Legendary' ? 'border-amber-200 text-amber-600 bg-amber-50' : 
                       'border-slate-200 text-slate-500 bg-slate-50'
                    }`}>
                      {item.difficulty}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{item.description}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   <div className="text-xs font-semibold text-safewill-teal flex items-center gap-1 cursor-pointer hover:underline">
                      View {item.partnerName} Offer <ExternalLink size={10} />
                   </div>
                   <button className="text-sm font-bold text-safewill-navy hover:text-safewill-blue transition-colors">
                     Edit Details
                   </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-center z-10">
        <button 
          onClick={onAccept}
          className="bg-safewill-navy text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-safewill-blue hover:scale-105 transition-all flex items-center gap-3"
        >
           Start My BucketQuest <ArrowRight size={24} />
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default BucketList;