import React, { useState } from 'react';
import { PencilIcon } from '@heroicons/react/24/solid';

interface EditNameProps {
  currentName: string;
  onNameChange: (newName: string) => void;
}

export default function EditName({ currentName, onNameChange }: EditNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameChange(name.trim());
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="inline-flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-white/20 rounded px-2 py-1 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/50"
          placeholder="Enter your name"
          autoFocus
        />
        <button
          type="submit"
          className="text-white/70 hover:text-white transition-colors"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => {
            setName(currentName);
            setIsEditing(false);
          }}
          className="text-white/70 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors"
    >
      <PencilIcon className="w-4 h-4" />
    </button>
  );
} 