import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface RewardPopupProps {
  label: string;
  position: { x: number; y: number };
  onComplete: () => void;
}

export default function RewardPopup({ label, position, onComplete }: RewardPopupProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: 1, y: -100, scale: 1.2 }}
      exit={{ opacity: 0, y: -150, scale: 0.8 }}
      transition={{ 
        duration: 1,
        ease: "easeOut",
      }}
      className="fixed text-white text-3xl font-bold"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        zIndex: 60,
        background: 'linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
        padding: '0.5rem 1rem',
        borderRadius: '1rem',
        backdropFilter: 'blur(4px)',
      }}
    >
      {label}
    </motion.div>
  );
} 