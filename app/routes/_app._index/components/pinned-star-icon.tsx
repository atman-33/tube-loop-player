import { Star } from "lucide-react";
import type React from "react";
import { usePlayerStore } from "~/stores/player";

interface PinnedStarIconProps {
  videoId: string;
  className?: string;
}

export const PinnedStarIcon: React.FC<PinnedStarIconProps> = ({
  videoId,
  className = "",
}) => {
  const { isPinned, togglePinnedSong } = usePlayerStore();
  const pinned = isPinned(videoId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePinnedSong(videoId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      togglePinnedSong(videoId);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`flex-shrink-0 text-muted-foreground hover:text-yellow-500 transition-colors duration-200 cursor-pointer ${className}`}
      aria-label={pinned ? "Unpin from favorites" : "Pin to favorites"}
      aria-pressed={pinned}
    >
      <Star
        className={`h-5 w-5 transition-all duration-200 ${
          pinned
            ? "fill-yellow-500 text-yellow-500 scale-110"
            : "hover:scale-110"
        }`}
      />
      <span className="sr-only">
        {pinned ? "Remove from favorites" : "Add to favorites"}
      </span>
    </button>
  );
};
