'use client';

import React, { useState, useEffect, useRef } from 'react';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import IdleTimer, { ACHIEVEMENTS } from '@/components/IdleTimer';
import Leaderboard from '@/components/Leaderboard';
import AmbientEvent from '@/components/AmbientEvent';
import { GameState, Achievement } from '@/types';
import { isMobileDevice } from '@/utils/mobile';
import TournamentTimer from '@/components/TournamentTimer';
import { useTournamentTimer } from '@/utils/tournament';

function ProTipFooter({ isMobile, showOverlay }: { isMobile: boolean; showOverlay: boolean }) {
  return (
    <div className={`${isMobile ? 'w-full' : 'fixed bottom-4 left-1/2 -translate-x-1/2'} bg-white/10 backdrop-blur-xl rounded-[20px] ${isMobile ? 'px-4 py-2' : 'px-5 py-3.5'} shadow-[0_4px_12px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/40`}>
      <p className={`text-white/90 text-sm font-light flex items-center justify-center gap-1.5`}>
        {isMobile ? (
          'Load up the game on desktop to compete'
        ) : (
          <>
            Pro tip: Just relax and do nothing. You're doing great! <span className="text-lg">🌴</span>
          </>
        )}
      </p>
    </div>
  );
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    idleTime: 0,
    currentTitle: 'Novice Napper',
    achievements: [],
    lastEventTime: Date.now(),
    bonusMultiplier: 1,
  });

  const { isActive: isTournamentActive } = useTournamentTimer();

  const [sessionId, setSessionId] = useState<string>('');
  const [showOverlay, setShowOverlay] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState('Anonymous Relaxer');
  const [isMobile, setIsMobile] = useState(false);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const mobile = isMobileDevice();
      setIsMobile(mobile);
    };

    // Check initially
    checkMobile();

    // Recheck on resize
    window.addEventListener('resize', checkMobile);

    // Set up session and audio
    setSessionId(`session_${Date.now()}`);
    bgMusicRef.current = new Audio('/images/bensound-thesunday.mp3');
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.3;

    // Try to load saved name from localStorage
    const savedName = localStorage.getItem('playerName');
    if (savedName && savedName !== 'Novice Napper') {
      setPlayerName(savedName);
    }

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.src = '';
      }
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const startGame = () => {
    if (bgMusicRef.current) {
      bgMusicRef.current.play().catch(error => {
        console.error('Error playing background music:', error);
      });
    }
    setShowOverlay(false);
    setGameStarted(true);
  };

  const handleNameChange = (newName: string) => {
    // Don't save achievement titles as custom names
    if (!ACHIEVEMENTS.some(achievement => achievement.title === newName) && newName !== 'Novice Napper') {
      setPlayerName(newName);
      localStorage.setItem('playerName', newName);
    } else {
      setPlayerName('Anonymous Relaxer');
      localStorage.removeItem('playerName');
    }
    
    // Update Firebase if we have an active session
    if (sessionId) {
      try {
        setDoc(doc(db, 'leaderboard', sessionId), {
          idleTime: gameState.idleTime,
          title: gameState.currentTitle,
          timestamp: Date.now(),
          playerName: newName,
        });
      } catch (error) {
        console.error('Error updating player name:', error);
      }
    }
  };

  const handleIdle = async (newState: GameState) => {
    if (!gameStarted) return;
    
    // Always update local state
    setGameState(prev => ({
      ...prev,
      idleTime: newState.idleTime,
      currentTitle: newState.currentTitle,
      achievements: newState.achievements
    }));
    
    // Only update leaderboard if tournament is active
    if (isTournamentActive && sessionId && newState.idleTime > 0 && newState.idleTime % 5 === 0) {
      try {
        await setDoc(doc(db, 'leaderboard', sessionId), {
          idleTime: newState.idleTime,
          title: newState.currentTitle,
          timestamp: Date.now(),
          playerName: playerName,
          isDesktop: !isMobile
        });
      } catch (error) {
        console.error('Error updating leaderboard:', error);
      }
    }
  };

  const handleAchievement = (achievement: Achievement) => {
    if (!gameStarted) return;
    
    const audio = new Audio('/achievement.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };

  const handleEventCatch = (bonus: number) => {
    if (!gameStarted) return;
    
    const newIdleTime = gameState.idleTime + bonus;
    
    // Always update local state
    setGameState(prev => ({
      ...prev,
      idleTime: newIdleTime,
      lastEventTime: Date.now()
    }));

    // Only update leaderboard if tournament is active
    if (isTournamentActive && sessionId) {
      try {
        setDoc(doc(db, 'leaderboard', sessionId), {
          idleTime: newIdleTime,
          title: gameState.currentTitle,
          timestamp: Date.now(),
          playerName: playerName,
          isDesktop: !isMobile
        });
      } catch (error) {
        console.error('Error updating leaderboard:', error);
      }
    }
  };

  const handleMobileClaim = async (totalSeconds: number) => {
    if (!isTournamentActive) return;
    
    // Update game state and leaderboard with claimed time
    const newState = {
      idleTime: totalSeconds,
      currentTitle: gameState.currentTitle,
      achievements: gameState.achievements,
      lastEventTime: Date.now(),
      bonusMultiplier: 1,
    };
    
    setGameState(newState);
    handleIdle(newState);
  };

  const hasGameStarted = () => {
    return gameStarted;
  };

  return (
    <main className="min-h-screen relative">
      {/* Background video */}
      <div className="fixed inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="object-cover w-full h-full"
          style={{ filter: 'brightness(1.1)' }}
        >
          <source src="/images/bg-animation.mp4" type="video/mp4" />
        </video>
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Game content */}
      {!showOverlay && (
        <div className="relative z-10">
          {isMobile ? (
            <div className="min-h-[100dvh] flex flex-col items-center px-4">
              {/* Title and Tournament Timer */}
              <div className="w-full text-center pt-safe">
                <div className="pt-6">
                  <h1 className="text-3xl font-medium text-white">
                    Lazy Day Tournament
                  </h1>
                  <TournamentTimer />
                </div>
              </div>

              {/* Leaderboard */}
              <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl rounded-[24px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/40 mt-4">
                <Leaderboard isMobile />
              </div>

              {/* Pro Tip Footer - Adjusted position */}
              <div className="mt-auto pb-safe">
                <div className="pb-6 w-full">
                  <ProTipFooter isMobile={true} showOverlay={showOverlay} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full text-center">
                <h1 className="text-3xl font-medium text-white">
                  Lazy Day Tournament
                </h1>
                <TournamentTimer />
              </div>
              <IdleTimer 
                onIdle={handleIdle} 
                onAchievement={handleAchievement}
                initialIdleTime={gameState.idleTime}
                playerName={playerName}
                onNameChange={handleNameChange}
              />
              <Leaderboard />
              <AmbientEvent onCatch={handleEventCatch} />

              <ProTipFooter isMobile={false} showOverlay={showOverlay} />
            </>
          )}
        </div>
      )}

      {/* Click to start overlay */}
      {showOverlay && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-pointer"
          onClick={startGame}
        >
          <div className="text-white text-center">
            <p className="text-2xl mb-4">
              Click anywhere to start
            </p>
          </div>
        </div>
      )}
    </main>
  );
} 