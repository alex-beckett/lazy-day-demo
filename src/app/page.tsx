'use client';

import { useState, useEffect, useRef } from 'react';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import IdleTimer from '@/components/IdleTimer';
import Leaderboard from '@/components/Leaderboard';
import AmbientEvent from '@/components/AmbientEvent';
import { GameState, Achievement } from '@/types';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    idleTime: 0,
    currentTitle: 'Novice Napper',
    achievements: [],
    lastEventTime: Date.now(),
    bonusMultiplier: 1,
  });

  const [sessionId, setSessionId] = useState<string>('');
  const [showOverlay, setShowOverlay] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setSessionId(`session_${Date.now()}`);
    // Initialize audio but don't play yet
    bgMusicRef.current = new Audio('/images/bensound-thesunday.mp3');
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.3;

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.src = '';
      }
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

  const handleIdle = async (newState: GameState) => {
    if (!gameStarted) return;
    
    setGameState(prev => ({
      ...prev,
      idleTime: newState.idleTime,
      currentTitle: newState.currentTitle,
      achievements: newState.achievements
    }));
    
    if (sessionId && newState.idleTime > 0 && newState.idleTime % 5 === 0) {
      try {
        await setDoc(doc(db, 'leaderboard', sessionId), {
          idleTime: newState.idleTime,
          title: newState.currentTitle,
          timestamp: Date.now(),
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
    
    setGameState(prev => ({
      ...prev,
      idleTime: newIdleTime,
      lastEventTime: Date.now()
    }));

    if (sessionId) {
      try {
        setDoc(doc(db, 'leaderboard', sessionId), {
          idleTime: newIdleTime,
          title: gameState.currentTitle,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Error updating leaderboard:', error);
      }
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
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

      {/* Game content - always rendered but controlled by gameStarted */}
      <div className="relative z-10">
        <IdleTimer 
          onIdle={handleIdle} 
          onAchievement={handleAchievement}
          initialIdleTime={gameState.idleTime}
        />
        <Leaderboard />
        <AmbientEvent onCatch={handleEventCatch} />

        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
          Pro tip: Just relax and do nothing. You're doing great! 🌴
        </div>
      </div>

      {/* Click to start overlay */}
      {showOverlay && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-pointer"
          onClick={startGame}
        >
          <div className="text-white text-2xl text-center">
            <p>Click anywhere to start</p>
          </div>
        </div>
      )}
    </main>
  );
} 