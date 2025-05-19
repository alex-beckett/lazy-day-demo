import { Achievement } from '@/types';

interface StorageData {
  checkInTimestamp: number;
  totalChillTime: number;
  claimedSessionHistory: Array<{
    timestamp: number;
    duration: number;
  }>;
  hasStarted: boolean;
}

const STORAGE_KEY = 'lazy-day-mobile-data';

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768
  );
}

export function initializeMobileSession(): void {
  const existingData = localStorage.getItem(STORAGE_KEY);
  if (!existingData) {
    const initialData: StorageData = {
      checkInTimestamp: Date.now(),
      totalChillTime: 0,
      claimedSessionHistory: [],
      hasStarted: false
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  }
}

export function startMobileGame(): void {
  const data = getMobileSessionData();
  const newData: StorageData = {
    ...data,
    hasStarted: true,
    checkInTimestamp: Date.now() // Reset timestamp when game actually starts
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
}

export function getMobileSessionData(): StorageData {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    initializeMobileSession();
    return getMobileSessionData();
  }
  return JSON.parse(data);
}

export function hasGameStarted(): boolean {
  const { hasStarted } = getMobileSessionData();
  return hasStarted;
}

export function getElapsedTime(): { seconds: number; formatted: string } {
  const { checkInTimestamp, hasStarted } = getMobileSessionData();
  
  // If game hasn't started, return 0
  if (!hasStarted) {
    return {
      seconds: 0,
      formatted: '0m'
    };
  }
  
  const elapsedSeconds = Math.floor((Date.now() - checkInTimestamp) / 1000);
  
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  
  const formatted = hours > 0 
    ? `${hours}h ${minutes}m`
    : `${minutes}m`;
    
  return {
    seconds: elapsedSeconds,
    formatted
  };
}

export function claimChillTime(): { 
  newTotal: number;
  claimed: number;
  formatted: string;
} {
  const data = getMobileSessionData();
  const elapsed = getElapsedTime();
  
  // Update storage with new total and reset check-in time
  const newData: StorageData = {
    checkInTimestamp: Date.now(),
    totalChillTime: data.totalChillTime + elapsed.seconds,
    claimedSessionHistory: [
      ...data.claimedSessionHistory,
      {
        timestamp: Date.now(),
        duration: elapsed.seconds
      }
    ],
    hasStarted: true
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  
  return {
    newTotal: newData.totalChillTime,
    claimed: elapsed.seconds,
    formatted: elapsed.formatted
  };
}

export function getTotalChillTime(): { seconds: number; formatted: string } {
  const { totalChillTime } = getMobileSessionData();
  
  const hours = Math.floor(totalChillTime / 3600);
  const minutes = Math.floor((totalChillTime % 3600) / 60);
  
  const formatted = hours > 0 
    ? `${hours}h ${minutes}m`
    : `${minutes}m`;
    
  return {
    seconds: totalChillTime,
    formatted
  };
} 