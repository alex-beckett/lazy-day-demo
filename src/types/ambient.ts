export interface EventType {
  type: 'balloon' | 'stick';
  weight: number;
  reward: number;
  imagePath: string;
  label: string;
}

export const EVENT_TYPES: EventType[] = [
  { 
    type: 'balloon',
    weight: 75,
    reward: 180,
    imagePath: '/images/balloon.png',
    label: '+3 min'
  },
  { 
    type: 'stick',
    weight: 25,
    reward: 300,
    imagePath: '/images/stick.png',
    label: '+5 min'
  }
];

export interface AmbientEventState {
  type: EventType['type'];
  timestamp: number;
  position: { x: number; y: number };
  reward: number;
  imagePath: string;
  label: string;
} 