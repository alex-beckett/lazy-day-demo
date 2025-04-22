import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LeaderboardEntry } from '@/types';
import { TrophyIcon } from '@heroicons/react/24/solid';

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  useEffect(() => {
    // Test Firebase connection
    console.log('Testing Firebase connection...');
    
    // Query the top 10 entries by idle time
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
      setConnectionStatus('Connected');
      console.log('Firebase connection successful!');
    }, (error) => {
      console.error("Error fetching leaderboard:", error);
      setConnectionStatus('Connection Error');
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="fixed top-4 right-4 w-80 bg-black/30 backdrop-blur-sm rounded-lg p-4 shadow-lg text-white">
      <div className="flex items-center gap-2 mb-4">
        <TrophyIcon className="w-6 h-6 text-yellow-400" />
        <h2 className="text-xl font-bold">Top Chillers</h2>
        <span className="text-xs text-gray-300">({connectionStatus})</span>
      </div>
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{index + 1}.</span>
              <div>
                <p className="font-medium">{entry.title}</p>
                <p className="text-sm text-gray-300">
                  {Math.floor(entry.idleTime / 60)}m {entry.idleTime % 60}s
                </p>
              </div>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-center text-gray-400">Starting to chill...</p>
        )}
      </div>
    </div>
  );
} 