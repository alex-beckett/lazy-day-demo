import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { AmbientEvent as AmbientEventType } from '@/types';

interface AmbientEventProps {
  onCatch: (bonus: number) => void;
}

interface ScheduledEvent {
  type: 'balloon' | 'stick';
  imagePath: string;
  timeInSeconds: number;
}

const SCHEDULED_EVENTS: ScheduledEvent[] = [
  { type: 'balloon', imagePath: '/images/balloon.png', timeInSeconds: 10 },
  { type: 'stick', imagePath: '/images/stick.png', timeInSeconds: 30 }
];

export default function AmbientEvent({ onCatch }: AmbientEventProps) {
  const [event, setEvent] = useState<(AmbientEventType & { imagePath: string }) | null>(null);
  const [xPosition, setXPosition] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const spawnEvent = (scheduledEvent: ScheduledEvent) => {
      // Ensure we leave enough space on both sides (20% of window width)
      const minX = window.innerWidth * 0.2;
      const maxX = window.innerWidth * 0.8;
      const x = Math.random() * (maxX - minX) + minX;

      setXPosition(x);
      setEvent({
        type: scheduledEvent.type,
        imagePath: scheduledEvent.imagePath,
        timestamp: Date.now(),
        duration: 15000,
        bonus: 300 // 5 minutes in seconds
      });

      setTimeout(() => setEvent(null), 15000);
    };

    const checkScheduledEvents = () => {
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      
      SCHEDULED_EVENTS.forEach(scheduledEvent => {
        if (Math.floor(elapsedSeconds) === scheduledEvent.timeInSeconds) {
          spawnEvent(scheduledEvent);
        }
      });
    };

    const interval = setInterval(checkScheduledEvents, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const handleClick = () => {
    if (event) {
      onCatch(event.bonus);
      setEvent(null);
    }
  };

  if (!event) return null;

  return (
    <div
      className="fixed cursor-pointer animate-fall"
      style={{
        left: xPosition,
        top: '20vh',
        zIndex: 50,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={handleClick}
    >
      <Image
        src={event.imagePath}
        alt={`Floating ${event.type}`}
        width={200}
        height={200}
        className="object-contain"
        priority
      />
    </div>
  );
}