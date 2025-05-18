import { EventType } from '@/types/ambient';

export function getWeightedRandomEvent(events: EventType[]): EventType {
  const totalWeight = events.reduce((sum, event) => sum + event.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const event of events) {
    random -= event.weight;
    if (random <= 0) {
      return event;
    }
  }
  
  return events[0]; // Fallback to first event (should never happen)
}

export function getRandomPosition(margin: number = 0.2): { x: number; y: number } {
  // Ensure we leave enough space on both sides (20% of window width by default)
  const minX = window.innerWidth * margin;
  const maxX = window.innerWidth * (1 - margin);
  
  return {
    x: Math.random() * (maxX - minX) + minX,
    y: window.innerHeight * 0.3 // Fixed Y position at 30% from top
  };
} 