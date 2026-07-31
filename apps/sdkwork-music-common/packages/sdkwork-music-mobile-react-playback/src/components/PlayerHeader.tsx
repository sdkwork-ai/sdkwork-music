import { ChevronDown, MoreVertical } from "lucide-react";

import { IconButton } from "@sdkwork/ui-mobile-react";

export interface PlayerHeaderProps {
  title: string;
  onBack: () => void;
  onMoreClick?: () => void;
}

export function PlayerHeader({ title, onBack, onMoreClick }: PlayerHeaderProps) {
  return (
    <header className="relative z-10 flex h-[56px] shrink-0 items-center justify-between px-4 pt-safe">
      <IconButton icon={<ChevronDown className="h-8 w-8 text-white" />} onClick={onBack} />
      <div className="flex flex-col items-center">
        <span className="text-[12px] opacity-70">正在播放</span>
        <span className="max-w-[200px] truncate text-[14px] font-medium">{title}</span>
      </div>
      {onMoreClick ? <IconButton icon={<MoreVertical className="h-6 w-6 text-white" />} onClick={onMoreClick} /> : <span className="w-10" aria-hidden="true" />}
    </header>
  );
}
