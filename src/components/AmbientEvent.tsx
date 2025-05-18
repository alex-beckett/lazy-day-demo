import React, { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { EVENT_TYPES, AmbientEventState } from '@/types/ambient';
import { getWeightedRandomEvent, getRandomPosition } from '@/utils/random';
import RewardPopup from './RewardPopup';

interface AmbientEventProps {
  onCatch: (bonus: number) => void;
}

const EVENT_INTERVAL = 20 * 60 * 1000; // 20 minutes
const FIRST_EVENT_DELAY = 2 * 60 * 1000; // 2 minutes
const EVENT_DURATION = 15 * 1000; // 15 seconds

export default function AmbientEvent({ onCatch }: AmbientEventProps) {
  const [event, setEvent] = useState<AmbientEventState | null>(null);
  const [showReward, setShowReward] = useState(false);
  const eventTimer = useRef<NodeJS.Timeout>();
  const dismissTimer = useRef<NodeJS.Timeout>();
  const isFirstEvent = useRef(true);

  const spawnEvent = useCallback(() => {
    console.log('Spawning event...');
    const selectedEvent = getWeightedRandomEvent(EVENT_TYPES);
    const position = getRandomPosition();
    
    setEvent({
      ...selectedEvent,
      timestamp: Date.now(),
      position
    });

    // Set up auto-dismiss
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
    }
    dismissTimer.current = setTimeout(() => {
      console.log('Auto-dismissing event');
      setEvent(null);
      
      // Schedule next event
      const nextDelay = EVENT_INTERVAL;
      console.log('Scheduling next event in', nextDelay / 1000, 'seconds');
      eventTimer.current = setTimeout(spawnEvent, nextDelay);
    }, EVENT_DURATION);
  }, []);

  // Initial setup
  useEffect(() => {
    console.log('Setting up first event in', FIRST_EVENT_DELAY / 1000, 'seconds');
    eventTimer.current = setTimeout(spawnEvent, FIRST_EVENT_DELAY);

    return () => {
      if (eventTimer.current) clearTimeout(eventTimer.current);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [spawnEvent]);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Tab hidden, pausing timers');
        if (eventTimer.current) clearTimeout(eventTimer.current);
        if (dismissTimer.current) clearTimeout(dismissTimer.current);
      } else {
        console.log('Tab visible, resuming');
        if (!event) {
          // If no event is showing, schedule next one
          const delay = isFirstEvent.current ? FIRST_EVENT_DELAY : EVENT_INTERVAL;
          console.log('Scheduling event with delay:', delay / 1000, 'seconds');
          eventTimer.current = setTimeout(spawnEvent, delay);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [event, spawnEvent]);

  const handleClick = useCallback(() => {
    if (event) {
      console.log('Event clicked');
      onCatch(event.reward);
      setShowReward(true);
      setEvent(null);
      isFirstEvent.current = false;

      // Clear existing timers
      if (eventTimer.current) clearTimeout(eventTimer.current);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);

      // Schedule next event
      console.log('Scheduling next event in', EVENT_INTERVAL / 1000, 'seconds');
      eventTimer.current = setTimeout(spawnEvent, EVENT_INTERVAL);
    }
  }, [event, onCatch, spawnEvent]);

  if (!event) return null;

  return (
    <>
      <motion.div
        className="fixed cursor-pointer"
        style={{
          left: event.position.x,
          top: event.position.y,
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
        }}
        onClick={handleClick}
        initial={{ opacity: 0, scale: 0.5, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          src={event.imagePath}
          alt={`Floating ${event.type}`}
          width={100}
          height={100}
          className="object-contain animate-float"
          priority
        />
      </motion.div>

      {showReward && (
        <RewardPopup
          label={event.label}
          position={event.position}
          onComplete={() => setShowReward(false)}
        />
      )}
    </>
  );
}