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