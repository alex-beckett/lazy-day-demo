import React, { useEffect, useState, useCallback } from 'react';
import { Achievement, GameState } from '@/types';

const ACHIEVEMENTS: Achievement[] = [
  { title: 'Intern of Inactivity', threshold: 300, description: '5 minutes of pure nothing' },
  { title: 'Certified Couch Potato', threshold: 900, description: '15 minutes of excellence in idling' },
  { title: 'Couch Czar', threshold: 1800, description: '30 minutes of masterful meditation' },
  { title: 'Zen Overlord', threshold: 3600, description: '1 hour of transcendent tranquility' },
];

interface IdleTimerProps {
  onIdle: (state: GameState) => void;
  onAchievement: (achievement: Achievement) => void;
  initialIdleTime?: number;
}

export default function IdleTimer({ onIdle, onAchievement, initialIdleTime = 0 }: IdleTimerProps) {
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
            lastSnapshotTime: now,
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
    <div className="fixed top-4 left-4 text-white bg-black/30 backdrop-blur-sm rounded-lg p-4 shadow-lg z-50">
      <h2 className="text-2xl font-bold mb-2">{state.currentTitle}</h2>
      <p className="text-lg">
        Time doing nothing: {Math.floor(state.idleTime / 60)}m {state.idleTime % 60}s
      </p>
      <p className="text-sm text-gray-300">
        Last activity: {Math.floor((Date.now() - state.lastActivity) / 1000)}s ago
      </p>
    </div>
  );
} 