import { motion } from "motion/react";

export interface PlayerCoverCardProps {
  coverUrl: string;
  isPlaying: boolean;
}

export function PlayerCoverCard({ coverUrl, isPlaying }: PlayerCoverCardProps) {
  return (
    <motion.div className="mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-3xl shadow-2xl" animate={{ scale: isPlaying ? 1 : 0.95 }} transition={{ type: "spring", bounce: 0.4 }}>
      <img src={coverUrl} alt="Cover" className="h-full w-full object-cover" />
    </motion.div>
  );
}
