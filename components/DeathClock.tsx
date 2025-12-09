import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { LIFE_EXPECTANCY } from '../constants';

interface DeathClockProps {
  age: number;
  compact?: boolean;
}

const DeathClock: React.FC<DeathClockProps> = ({ age, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState({
    years: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Calculate target date using precise millisecond math for float years (e.g. 81.3)
    const currentYear = new Date().getFullYear();
    // Assume birth was Jan 1st of the derived birth year for estimation
    const birthYear = currentYear - age;
    const birthDate = new Date(birthYear, 0, 1);
    
    // Convert life expectancy years to milliseconds (approx 365.25 days per year)
    const lifeExpectancyMs = LIFE_EXPECTANCY * 365.25 * 24 * 60 * 60 * 1000;
    const targetDate = new Date(birthDate.getTime() + lifeExpectancyMs);

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const years = Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25));
        const days = Math.floor((difference % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ years, days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [age]);

  if (compact) {
    return (
      <div className="flex items-center gap-2 font-mono text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
        <Clock size={14} className="text-red-500 animate-pulse" />
        <span>
          {timeLeft.years}y : {timeLeft.days}d : {timeLeft.hours}h : {timeLeft.minutes}m : {timeLeft.seconds}s
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-center gap-2 text-red-500 text-sm font-bold uppercase tracking-wider mb-2 animate-pulse">
         <Clock size={16} /> Time Remaining
      </div>
      <div className="text-3xl md:text-4xl font-bold text-safewill-navy font-mono tracking-tighter">
        {timeLeft.years}<span className="text-base text-slate-400 font-sans mx-1">y</span>
        {timeLeft.days}<span className="text-base text-slate-400 font-sans mx-1">d</span>
        {timeLeft.hours}<span className="text-base text-slate-400 font-sans mx-1">h</span>
      </div>
      <div className="text-xl md:text-2xl font-bold text-safewill-navy font-mono tracking-tighter mt-1">
        {timeLeft.minutes}<span className="text-sm text-slate-400 font-sans mx-1">m</span>
        {timeLeft.seconds}<span className="text-sm text-slate-400 font-sans mx-1">s</span>
      </div>
      <p className="text-xs text-slate-400 mt-3">
        Based on avg expectancy ({LIFE_EXPECTANCY}y). Every second counts.
      </p>
    </div>
  );
};

export default DeathClock;