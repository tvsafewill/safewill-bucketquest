import React, { useState } from 'react';
import { UserProfile, BucketItem } from './types';
import Onboarding from './components/Onboarding';
import BucketList from './components/BucketList';
import LifeProgress from './components/LifeProgress';
import { generateBucketList } from './services/geminiService';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'onboarding' | 'review' | 'progress'>('onboarding');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bucketItems, setBucketItems] = useState<BucketItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleOnboardingComplete = async (initialProfile: UserProfile) => {
    // Set initial profile state
    setUserProfile(initialProfile);
    setCurrentScreen('review');
    setIsLoading(true);

    // Call Gemini API to get items, generated theme, and images
    const result = await generateBucketList(initialProfile);
    
    // Update profile with AI generated theme and image
    setUserProfile(prev => prev ? { 
      ...prev, 
      theme: result.themeTitle,
      themeDescription: result.themeDescription,
      themeImage: result.themeImage
    } : null);

    setBucketItems(result.items);
    setIsLoading(false);
  };

  const handleAcceptQuest = () => {
    setCurrentScreen('progress');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-200 selection:text-teal-900">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="bg-safewill-navy h-8 w-8 rounded flex items-center justify-center text-white font-serif font-bold text-lg">S</div>
             <span className="font-bold text-safewill-navy text-xl tracking-tight hidden md:block">Safewill</span>
           </div>
           {userProfile && (
             <div className="text-sm font-medium text-slate-500">
               {currentScreen === 'progress' ? 'Mode: Living Life' : 'Mode: Planning'}
             </div>
           )}
        </div>
      </nav>

      <main className="py-8">
        {currentScreen === 'onboarding' && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}

        {currentScreen === 'review' && userProfile && (
          <BucketList 
            userProfile={userProfile} 
            items={bucketItems} 
            isLoading={isLoading}
            onAccept={handleAcceptQuest}
          />
        )}

        {currentScreen === 'progress' && userProfile && (
          <LifeProgress 
            userProfile={userProfile} 
            initialItems={bucketItems} 
          />
        )}
      </main>
      
      {/* Decorative footer */}
      <footer className="py-6 text-center text-slate-400 text-xs">
        <p>© {new Date().getFullYear()} Safewill. Built for Vibeathon.</p>
      </footer>
    </div>
  );
};

export default App;