import { Achievement } from '@/types';

interface StorageData {
  checkInTimestamp: number;
  totalChillTime: number;
  hasStarted: boolean;
}

const STORAGE_KEY = 'lazy_day_mobile_session';

function getStorageData(): StorageData {
  const defaultData: StorageData = {
    checkInTimestamp: Date.now(),
    totalChillTime: 0,
    hasStarted: false
  };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultData;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading storage:', error);
    return defaultData;
  }
}

export function startChilling(): void {
  const data = getStorageData();
  const newData: StorageData = {
    ...data,
    checkInTimestamp: Date.now(),
    hasStarted: true
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
}

export function hasStartedChilling(): boolean {
  return getStorageData().hasStarted;
}

export function getElapsedTime(): { seconds: number; formatted: string } {
  const { checkInTimestamp, hasStarted } = getStorageData();
  
  if (!hasStarted) {
    return {
      seconds: 0,
      formatted: '0m'
    };
  }
  
  const elapsedSeconds = Math.floor((Date.now() - checkInTimestamp) / 1000);
  return formatDuration(elapsedSeconds);
}

export function getTotalChillTime(): { seconds: number; formatted: string } {
  const { totalChillTime } = getStorageData();
  return formatDuration(totalChillTime);
}

export function claimChillTime(): { 
  newTotal: number;
  claimed: number;
  formatted: string;
} {
  const data = getStorageData();
  const elapsed = getElapsedTime();
  
  const newData: StorageData = {
    checkInTimestamp: Date.now(),
    totalChillTime: data.totalChillTime + elapsed.seconds,
    hasStarted: true
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  
  return {
    newTotal: newData.totalChillTime,
    claimed: elapsed.seconds,
    formatted: elapsed.formatted
  };
}

function formatDuration(seconds: number): { seconds: number; formatted: string } {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  let formatted: string;
  if (hours > 0) {
    formatted = `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    formatted = `${minutes}m`;
  } else {
    formatted = 'Just started';
  }
  
  return {
    seconds,
    formatted
  };
}

export function isMobileDevice(): boolean {
  return window.innerWidth <= 768;
} 