import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getElapsedTime, getTotalChillTime, claimChillTime, hasGameStarted } from '@/utils/mobile';
import EditName from './EditName';

interface MobileChillTimerProps {
  onClaim: (totalSeconds: number) => void;
  playerName: string;
  onNameChange: (newName: string) => void;
}

export default function MobileChillTimer({ onClaim, playerName, onNameChange }: MobileChillTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(getElapsedTime());
  const [totalTime, setTotalTime] = useState(getTotalChillTime());
  const [showClaimed, setShowClaimed] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState('');
  const [gameStarted, setGameStarted] = useState(hasGameStarted());

  // Update elapsed time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(getElapsedTime());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const handleClaim = () => {
    const result = claimChillTime();
    setClaimedAmount(result.formatted);
    setShowClaimed(true);
    setTotalTime(getTotalChillTime());
    onClaim(result.newTotal);

    // Hide the claimed message after 3 seconds
    setTimeout(() => {
      setShowClaimed(false);
    }, 3000);
  };

  if (!gameStarted) {
    return (
      <div className="text-center">
        <div className="mb-8" />
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="text-3xl font-medium">
            {playerName === 'Anonymous Relaxer' ? 'Novice Napper' : playerName}
          </h1>
          <EditName 
            currentName={playerName === 'Anonymous Relaxer' ? 'Novice Napper' : playerName} 
            onNameChange={onNameChange} 
          />
        </div>
        <h2 className="text-2xl font-medium mb-2">
          You've been away for {elapsedTime.formatted}
        </h2>
        <p className="text-xl text-white/80">
          That's {elapsedTime.formatted} of peak stillness
        </p>
      </div>

      <div className="space-y-6">
        <button
          onClick={handleClaim}
          className="bg-white/10 backdrop-blur-xl rounded-[20px] px-8 py-4 text-xl font-medium 
                   shadow-[0_4px_12px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/40
                   hover:bg-white/20 transition-colors duration-200"
        >
          Claim Chill Time
        </button>

        <div className="text-lg text-white/70">
          Total time being chill: {totalTime.formatted}
        </div>

        {/* Claimed animation */}
        {showClaimed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 
                     bg-white/10 backdrop-blur-xl rounded-[20px] px-6 py-4
                     shadow-[0_4px_12px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/40"
          >
            <p className="text-xl">
              +{claimedAmount} added to your chill time! 🌴
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
} 