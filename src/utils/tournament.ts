import { useState, useEffect } from 'react';

// Tournament configuration
export const TOURNAMENT_START = new Date("2025-05-22T16:00:00Z"); // 9:00 AM PST
export const TOURNAMENT_END = new Date("2025-05-23T16:00:00Z");   // 9:00 AM PST next day
export const USE_TEST_WINDOW = true;
export const TEST_START = new Date();
export const TEST_END = new Date(Date.now() + 5 * 60 * 1000);

export const startTime = USE_TEST_WINDOW ? TEST_START : TOURNAMENT_START;
export const endTime = USE_TEST_WINDOW ? TEST_END : TOURNAMENT_END;

export type TournamentState = 'not_started' | 'in_progress' | 'completed';

export function useTournamentTimer() {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [tournamentState, setTournamentState] = useState<TournamentState>('not_started');

  useEffect(() => {
    function updateTimer() {
      const now = Date.now();
      
      if (now < startTime.getTime()) {
        setTimeRemaining(startTime.getTime() - now);
        setTournamentState('not_started');
      } else if (now < endTime.getTime()) {
        setTimeRemaining(endTime.getTime() - now);
        setTournamentState('in_progress');
      } else {
        setTimeRemaining(0);
        setTournamentState('completed');
      }
    }

    // Initial update
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  return {
    hours,
    minutes,
    tournamentState,
    isActive: tournamentState === 'in_progress'
  };
} 