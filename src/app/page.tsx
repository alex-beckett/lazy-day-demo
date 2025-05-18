'use client';

import React, { useState, useEffect, useRef } from 'react';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import IdleTimer, { ACHIEVEMENTS } from '@/components/IdleTimer';
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
  const [playerName, setPlayerName] = useState('Anonymous Relaxer');
  const [isMobile, setIsMobile] = useState(false);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.innerWidth <= 768);
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
    if (isMobile) return; // Prevent game start on mobile

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
    if (sessionId && gameStarted) {
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
          playerName: playerName,
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
          playerName: playerName,
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

      {/* Game content - only render if not mobile */}
      {!isMobile && gameStarted && (
        <div className="relative z-10">
          <IdleTimer 
            onIdle={handleIdle} 
            onAchievement={handleAchievement}
            initialIdleTime={gameState.idleTime}
            playerName={playerName}
            onNameChange={handleNameChange}
          />
          <Leaderboard />
          <AmbientEvent onCatch={handleEventCatch} />

          {/* Pro tip footer */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl rounded-[20px] px-5 py-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/40">
            <p className="text-white/90 text-sm font-light flex items-center gap-2">
              Pro tip: Just relax and do nothing. You're doing great! <span className="text-lg">🌴</span>
            </p>
          </div>
        </div>
      )}

      {/* Click to start overlay */}
      {showOverlay && (
        <div 
          className={`fixed inset-0 z-50 bg-black/80 flex items-center justify-center ${!isMobile ? 'cursor-pointer' : ''}`}
          onClick={startGame}
        >
          <div className="text-white text-center">
            <p className="text-2xl">
              {isMobile ? (
                "Switch to desktop to play!"
              ) : (
                "Click anywhere to start"
              )}
            </p>
            {isMobile && (
              <p className="mt-2 text-white/60">
                This game is designed for desktop use only
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
} 