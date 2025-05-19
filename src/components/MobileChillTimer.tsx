import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getElapsedTime, getTotalChillTime, claimChillTime, startChilling, hasStartedChilling } from '@/utils/mobile';

interface MobileChillTimerProps {
  onClaim: (totalSeconds: number) => void;
  playerName: string;
}

export default function MobileChillTimer({ onClaim, playerName }: MobileChillTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(getElapsedTime());
  const [totalTime, setTotalTime] = useState(getTotalChillTime());
  const [showClaimed, setShowClaimed] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState('');
  const [hasStarted, setHasStarted] = useState(hasStartedChilling());

  // Update elapsed time every minute if started
  useEffect(() => {
    if (!hasStarted) return;

    const timer = setInterval(() => {
      setElapsedTime(getElapsedTime());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [hasStarted]);

  const handleStart = () => {
    startChilling();
    setHasStarted(true);
  };

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

  if (!hasStarted) {
    return (
      <div className="text-center">
        <button
          onClick={handleStart}
          className="w-full bg-white/10 backdrop-blur-xl rounded-[20px] px-8 py-4 text-xl font-medium text-white
                   shadow-[0_4px_12px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/40
                   hover:bg-white/20 transition-colors duration-200"
        >
          Start Chilling
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-6">
        <h1 className="text-3xl font-medium text-white mb-2">
          {playerName === 'Anonymous Relaxer' ? 'Still chilling...' : playerName}
        </h1>
        <h2 className="text-2xl font-medium mb-2 text-white">
          You've been away for {elapsedTime.formatted}
        </h2>
        <p className="text-xl text-white/80">
          Total chill time: {totalTime.formatted}
        </p>
      </div>

      <div className="space-y-6">
        <button
          onClick={handleClaim}
          className="w-full bg-white/10 backdrop-blur-xl rounded-[20px] px-8 py-4 text-xl font-medium text-white
                   shadow-[0_4px_12px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/40
                   hover:bg-white/20 transition-colors duration-200"
        >
          Claim Chill Time
        </button>
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
          <p className="text-xl text-white">
            +{claimedAmount} added to your chill time! 🌴
          </p>
        </motion.div>
      )}
    </div>
  );
} 