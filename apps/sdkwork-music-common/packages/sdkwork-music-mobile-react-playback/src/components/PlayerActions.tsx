import { Laptop, ListMusic } from "lucide-react";

import { IconButton } from "@sdkwork/ui-mobile-react";

export interface PlayerActionsProps {
  onDevicesClick?: () => void;
  onPlaylistClick?: () => void;
}

export function PlayerActions({ onDevicesClick, onPlaylistClick }: PlayerActionsProps) {
  if (!onDevicesClick && !onPlaylistClick) return null;
  return (
    <div className="flex items-center justify-between px-2 pt-4 opacity-80">
      {onDevicesClick && <IconButton icon={<Laptop className="h-5 w-5 text-white" />} onClick={onDevicesClick} />}
      {onPlaylistClick && <IconButton icon={<ListMusic className="h-6 w-6 text-white" />} onClick={onPlaylistClick} />}
    </div>
  );
}
