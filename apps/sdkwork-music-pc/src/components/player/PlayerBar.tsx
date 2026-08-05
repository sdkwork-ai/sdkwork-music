import { usePlayer } from '../../providers/PlayerProvider';

export function PlayerBar() {
  const { currentTrack, isPlaying, progress, duration, togglePlay, seekTo } = usePlayer();

  if (!currentTrack) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newProgress = (clickX / width) * duration;
    seekTo(newProgress);
  };

  return (
    <div className="player-bar">
      <div className="player-track-info">
        <div className="player-track-cover">
          <span>♪</span>
        </div>
        <div className="player-track-details">
          <h4 className="player-track-title">{currentTrack.title}</h4>
          <p className="player-track-artist">{currentTrack.artistName || 'Unknown Artist'}</p>
        </div>
      </div>
      
      <div className="player-controls">
        <button className="player-button" onClick={togglePlay}>
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>
      
      <div className="player-progress">
        <span className="player-time">{formatTime(progress)}</span>
        <div className="player-progress-bar" onClick={handleProgressClick}>
          <div 
            className="player-progress-fill" 
            style={{ width: `${(progress / duration) * 100}%` }}
          />
        </div>
        <span className="player-time">{formatTime(duration)}</span>
      </div>
    </div>
  );
}
