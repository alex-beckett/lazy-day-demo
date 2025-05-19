import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LeaderboardEntry } from '@/types';
import { TrophyIcon } from '@heroicons/react/24/solid';

interface LeaderboardProps {
  isMobile?: boolean;
}

export default function Leaderboard({ isMobile = false }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [showConnecting, setShowConnecting] = useState(true);

  useEffect(() => {
    // Query the top 10 entries by idle time (we'll filter for mobile display in the render)
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('idleTime', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newEntries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LeaderboardEntry));
      
      // Sort by idle time in descending order
      newEntries.sort((a, b) => b.idleTime - a.idleTime);
      setEntries(newEntries);
      
      // Hide the connecting text after 5 seconds
      setTimeout(() => {
        setShowConnecting(false);
      }, 5000);
    }, (error) => {
      console.error("Error fetching leaderboard:", error);
    });

    return () => unsubscribe();
  }, []);

  // Filter entries for mobile display
  const displayEntries = isMobile ? entries.slice(0, 3) : entries;

  const baseClasses = "bg-white/10 backdrop-blur-xl rounded-[24px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/40";
  const positionClasses = isMobile ? "w-full" : "fixed top-4 right-4 w-72";

  return (
    <div className={`${baseClasses} ${positionClasses}`}>
      <div className="flex items-center gap-2 mb-4">
        <TrophyIcon className="w-5 h-5 text-[#FF9500]" />
        <h2 className="text-xl font-medium tracking-tight text-white">
          {isMobile ? "Top 3 Chillers" : "Top Chillers"}
        </h2>
        {showConnecting && entries.length === 0 && (
          <span className="text-xs text-white/60">(Connecting...)</span>
        )}
      </div>
      <div className="space-y-2">
        {displayEntries.map((entry, index) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors duration-200"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base font-medium text-white/90 shrink-0">{index + 1}.</span>
              <p className="font-light truncate text-white/90">
                {entry.playerName === 'Anonymous Relaxer' ? entry.title : entry.playerName}
              </p>
            </div>
            <p className="text-sm text-white/70 shrink-0 ml-2 tabular-nums">
              {Math.floor(entry.idleTime / 60)}m {entry.idleTime % 60}s
            </p>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-center text-white/50 font-light">Starting to chill...</p>
        )}
      </div>
    </div>
  );
} 