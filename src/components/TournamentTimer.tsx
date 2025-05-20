import { useTournamentTimer } from '@/utils/tournament';

export default function TournamentTimer() {
  const { hours, minutes, tournamentState } = useTournamentTimer();

  let timerText = '';
  switch (tournamentState) {
    case 'not_started':
      timerText = `🔜 Tournament starts in: ${hours}h ${minutes}m`;
      break;
    case 'in_progress':
      timerText = `🕒 Time remaining: ${hours}h ${minutes}m`;
      break;
    case 'completed':
      timerText = '🏁 Lazy Day Tournament Complete';
      break;
  }

  return (
    <p className="text-sm text-white/70 mt-2 text-center">
      {timerText}
    </p>
  );
} 