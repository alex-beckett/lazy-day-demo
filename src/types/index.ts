export interface LeaderboardEntry {
  id: string;
  idleTime: number;
  title: string;
  timestamp: number;
}

export interface Achievement {
  title: string;
  threshold: number; // in seconds
  description: string;
}

export interface AmbientEvent {
  type: 'balloon' | 'stick' | 'star' | 'bird';
  timestamp: number;
  duration: number;
  bonus: number;
}

export interface GameState {
  idleTime: number;
  currentTitle: string;
  achievements: Achievement[];
  lastEventTime: number;
  bonusMultiplier: number;
  lastSnapshotTime?: number; // Optional timestamp for the last snapshot
} 