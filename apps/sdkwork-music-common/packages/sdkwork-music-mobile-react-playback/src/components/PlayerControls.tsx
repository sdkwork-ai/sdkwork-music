import type { ChangeEvent } from "react";
import { Heart, Pause, Play, SkipBack, SkipForward } from "lucide-react";

import { IconButton } from "@sdkwork/ui-mobile-react";

export interface PlayerControlsProps {
  title: string;
  artist: string;
  isLiked?: boolean;
  onToggleLike?: () => void;
  progress: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (event: ChangeEvent<HTMLInputElement>) => void;
  onTogglePlay: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  formatTime: (seconds: number) => string;
}

export function PlayerControls(props: PlayerControlsProps) {
  const { title, artist, isLiked, onToggleLike, progress, duration, isPlaying, onSeek, onTogglePlay, onPrevious, onNext, formatTime } = props;
  return (
    <div className="mt-8 flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 flex-col pr-4">
          <h1 className="truncate text-[24px] font-bold">{title}</h1>
          <p className="truncate text-[16px] text-white/70">{artist}</p>
        </div>
        {onToggleLike && typeof isLiked === "boolean" && (
          <IconButton icon={<Heart className={`h-7 w-7 ${isLiked ? "fill-[#1ED760] text-[#1ED760]" : "text-white"}`} />} onClick={onToggleLike} />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <input type="range" min="0" max={duration || 100} value={progress} onChange={onSeek} className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-white" />
        <div className="flex justify-between text-[12px] font-medium text-white/50">
          <span>{formatTime(progress)}</span><span>{formatTime(duration)}</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-8 px-2">
        {onPrevious && <IconButton icon={<SkipBack className="h-8 w-8 fill-white text-white" />} onClick={onPrevious} />}
        <button type="button" aria-label={isPlaying ? "Pause" : "Play"} className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black transition-transform active:scale-95" onClick={onTogglePlay}>
          {isPlaying ? <Pause className="h-8 w-8 fill-black" /> : <Play className="ml-1 h-8 w-8 fill-black" />}
        </button>
        {onNext && <IconButton icon={<SkipForward className="h-8 w-8 fill-white text-white" />} onClick={onNext} />}
      </div>
    </div>
  );
}
