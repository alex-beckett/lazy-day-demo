import React, { useEffect, useState, useCallback } from 'react';
import { Achievement, GameState } from '@/types';
import EditName from './EditName';

export const ACHIEVEMENTS: Achievement[] = [
  { title: 'Intern of Inactivity', threshold: 300, description: '5 minutes of pure nothing' },
  { title: 'Certified Couch Potato', threshold: 900, description: '15 minutes of excellence in idling' },
  { title: 'Couch Captain', threshold: 1800, description: '30 minutes of masterful meditation' },
  { title: 'Zen Overlord', threshold: 3600, description: '1 hour of transcendent tranquility' },
  { title: 'Patron of Passivity', threshold: 7200, description: '2 hours of perfect peace' },
  { title: 'Supreme Slacker', threshold: 10800, description: '3 hours of superior stillness' },
  { title: 'Master of Horizontal Life', threshold: 14400, description: '4 hours of harmonious hibernation' },
  { title: 'Glorified Do-Nothing', threshold: 18000, description: '5 hours of graceful inertia' },
  { title: 'The Still Sentinel', threshold: 21600, description: '6 hours of serene stasis' },
  { title: 'Warden of the Waves', threshold: 28800, description: '8 hours of wavelike wisdom' },
  { title: 'High Priest of Hammocks', threshold: 36000, description: '10 hours of heavenly hanging' },
  { title: 'Ambassador of Apathy', threshold: 43200, description: '12 hours of artful abstention' },
  { title: 'Emissary of Ennui', threshold: 50400, description: '14 hours of ethereal emptiness' },
  { title: 'Champion of Chill', threshold: 57600, description: '16 hours of celestial calm' },
  { title: 'Monarch of Motionlessness', threshold: 64800, description: '18 hours of majestic mindfulness' },
  { title: 'Deity of Drowsiness', threshold: 72000, description: '20 hours of divine detachment' },
  { title: 'Laziness Embodied', threshold: 79200, description: '22 hours of legendary lethargy' },
  { title: 'Legend of Lazy Day', threshold: 86400, description: '24 hours of limitless leisure' }
];

interface IdleTimerProps {
  onIdle: (state: GameState) => void;
  onAchievement: (achievement: Achievement) => void;
  initialIdleTime?: number;
  onNameChange: (newName: string) => void;
  playerName: string;
}

export default function IdleTimer({ onIdle, onAchievement, initialIdleTime = 0, onNameChange, playerName }: IdleTimerProps) {
  const [state, setState] = useState({
    idleTime: initialIdleTime,
    currentTitle: 'Novice Napper',
    achievements: [] as Achievement[],
    lastActivity: Date.now()
  });

  // Update state when initialIdleTime changes (from caught events)
  useEffect(() => {
    setState(prev => ({
      ...prev,
      idleTime: initialIdleTime
    }));
  }, [initialIdleTime]);

  // Memoize the achievement check to prevent unnecessary re-renders
  const checkAchievements = useCallback((time: number) => {
    const newAchievements = ACHIEVEMENTS.filter(
      achievement => time >= achievement.threshold && 
      !state.achievements.find(a => a.title === achievement.title)
    );

    if (newAchievements.length > 0) {
      const latestAchievement = newAchievements[newAchievements.length - 1];
      setState(prev => ({
        ...prev,
        currentTitle: latestAchievement.title,
        achievements: [...prev.achievements, ...newAchievements]
      }));
      newAchievements.forEach(achievement => onAchievement(achievement));
    }
  }, [onAchievement, state.achievements]);

  // Handle activity detection
  const handleActivity = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastActivity: Date.now()
    }));
  }, []);

  // Set up the timer
  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => {
        const now = Date.now();
        const timeSinceActivity = now - prev.lastActivity;
        
        // Only increment if we've been idle
        if (timeSinceActivity >= 1000) {
          const newTime = prev.idleTime + 1;
          
          // Check achievements after updating time
          checkAchievements(newTime);
          
          // Notify parent
          onIdle({
            idleTime: newTime,
            currentTitle: prev.currentTitle,
            achievements: prev.achievements,
            lastEventTime: now,
            bonusMultiplier: 1,
          });
          
          return {
            ...prev,
            idleTime: newTime
          };
        }
        return prev;
      });
    }, 1000);

    // Set up activity listeners
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      clearInterval(timer);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [handleActivity, checkAchievements, onIdle]);

  return (
    <div className="fixed top-4 left-4 text-white bg-white/10 backdrop-blur-xl rounded-[24px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/40">
      <div className="flex items-center gap-3 mb-3 relative">
        <h2 className="text-2xl font-medium tracking-tight">{playerName === 'Anonymous Relaxer' ? state.currentTitle : playerName}</h2>
        <EditName currentName={playerName === 'Anonymous Relaxer' ? state.currentTitle : playerName} onNameChange={onNameChange} />
      </div>
      <p className="text-lg font-light opacity-90">
        Time doing nothing: {Math.floor(state.idleTime / 60)}m {state.idleTime % 60}s
      </p>
    </div>
  );
} 