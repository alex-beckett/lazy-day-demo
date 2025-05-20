import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Achievement, GameState } from '@/types';
import EditName from './EditName';
import { useTournamentTimer } from '@/utils/tournament';

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

export function checkAchievements(time: number, currentAchievements: Achievement[] = []): {
  newAchievements: Achievement[];
  highestTitle: string;
} {
  const newAchievements = ACHIEVEMENTS.filter(
    achievement => time >= achievement.threshold && 
    !currentAchievements.find(a => a.title === achievement.title)
  );

  // Get the highest title based on time
  const eligibleAchievements = ACHIEVEMENTS.filter(a => time >= a.threshold);
  const highestTitle = eligibleAchievements.length > 0 
    ? eligibleAchievements[eligibleAchievements.length - 1].title
    : 'Novice Napper';

  return {
    newAchievements,
    highestTitle
  };
}

export default function IdleTimer({ onIdle, onAchievement, initialIdleTime = 0, onNameChange, playerName }: IdleTimerProps) {
  const [state, setState] = useState({
    idleTime: initialIdleTime,
    currentTitle: 'Novice Napper',
    achievements: [] as Achievement[],
    isIdle: false
  });

  const { tournamentState } = useTournamentTimer();
  const isTournamentActive = tournamentState === 'in_progress';

  // Track last activity time and idle status in refs
  const lastActivityRef = useRef(Date.now());
  const isIdleRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const lastUpdateRef = useRef(Date.now());
  const finalScoreRef = useRef(initialIdleTime);

  // Update state when initialIdleTime changes (from caught events or mobile claims)
  useEffect(() => {
    if (initialIdleTime !== state.idleTime) {
      const { newAchievements, highestTitle } = checkAchievements(initialIdleTime, state.achievements);
      
      setState(prev => ({
        ...prev,
        idleTime: initialIdleTime,
        currentTitle: highestTitle,
        achievements: [...prev.achievements, ...newAchievements]
      }));

      newAchievements.forEach(achievement => onAchievement(achievement));
    }
  }, [initialIdleTime, onAchievement, state.achievements, state.idleTime]);

  // Handle activity detection
  const handleActivity = useCallback(() => {
    // Don't track activity if tournament is over
    if (tournamentState === 'completed') return;

    const now = Date.now();
    // Only consider it as activity if more than 100ms has passed since last activity
    // This prevents micro-movements from resetting the timer
    if (now - lastActivityRef.current > 100) {
      lastActivityRef.current = now;
      lastUpdateRef.current = now; // Reset the update timer when activity is detected
      isIdleRef.current = false;
      setState(prev => ({ ...prev, isIdle: false }));
    }
  }, [tournamentState]);

  // Set up the timer
  useEffect(() => {
    function checkIdleState() {
      // If tournament is over, use the final score
      if (tournamentState === 'completed') {
        if (state.idleTime !== finalScoreRef.current) {
          setState(prev => ({ 
            ...prev, 
            idleTime: finalScoreRef.current,
            isIdle: false 
          }));
        }
        return;
      }

      const now = Date.now();
      const timeSinceActivity = now - lastActivityRef.current;
      
      // Consider idle after 2 seconds of no activity
      const isNowIdle = timeSinceActivity >= 2000;
      
      if (isNowIdle !== isIdleRef.current) {
        isIdleRef.current = isNowIdle;
        if (isNowIdle) {
          // When becoming idle, set the lastUpdateRef to now
          lastUpdateRef.current = now;
        }
        setState(prev => ({ ...prev, isIdle: isNowIdle }));
      }

      // Only increment time if we're idle and tournament is active
      if (isNowIdle && isTournamentActive) {
        const timeSinceLastUpdate = now - lastUpdateRef.current;
        if (timeSinceLastUpdate >= 1000) {
          const secondsToAdd = Math.floor(timeSinceLastUpdate / 1000);
          lastUpdateRef.current = now - (timeSinceLastUpdate % 1000);

          setState(prev => {
            const newTime = prev.idleTime + secondsToAdd;
            const { newAchievements, highestTitle } = checkAchievements(newTime, prev.achievements);

            // Store the final score when tournament is active
            finalScoreRef.current = newTime;

            onIdle({
              idleTime: newTime,
              currentTitle: highestTitle,
              achievements: [...prev.achievements, ...newAchievements],
              lastEventTime: now,
              bonusMultiplier: 1,
            });

            newAchievements.forEach(achievement => onAchievement(achievement));

            return {
              ...prev,
              idleTime: newTime,
              currentTitle: highestTitle,
              achievements: [...prev.achievements, ...newAchievements],
              isIdle: true
            };
          });
        }
      }
    }

    // Run the check more frequently for better responsiveness
    timerRef.current = setInterval(checkIdleState, 100);

    // Only track mouse movement events
    const events = ['mousemove'];
    events.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [handleActivity, onAchievement, onIdle, tournamentState, isTournamentActive]);

  return (
    <div className={`fixed top-4 left-4 text-white bg-white/10 backdrop-blur-xl rounded-[24px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.12)] ring-1 ring-inset ${state.isIdle && isTournamentActive ? 'ring-green-400/40' : 'ring-white/40'} transition-colors duration-300`}>
      <div className="flex items-center gap-3 mb-3 relative">
        <h2 className="text-2xl font-medium tracking-tight">{playerName === 'Anonymous Relaxer' ? state.currentTitle : playerName}</h2>
        <EditName currentName={playerName === 'Anonymous Relaxer' ? state.currentTitle : playerName} onNameChange={onNameChange} />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-light opacity-90">
          Time doing nothing: {Math.floor(state.idleTime / 60)}m {state.idleTime % 60}s
        </p>
        <p className="text-sm font-light opacity-70">
          Status: {tournamentState === 'completed' ? '🏁 Tournament Complete' : state.isIdle ? '😴 Chilling...' : '👀 Active'}
        </p>
      </div>
    </div>
  );
} 