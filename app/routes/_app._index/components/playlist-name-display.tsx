import { useState, useRef, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';

interface PlaylistNameDisplayProps {
  name: string;
  className?: string;
}

export const PlaylistNameDisplay = ({ name, className }: PlaylistNameDisplayProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isTruncated, setIsTruncated] = useState(true);
  const textRef = useRef<HTMLDivElement>(null);

  // Check if text is truncated (for multi-line text)
  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        // For multi-line text, check if scrollHeight > clientHeight
        setTimeout(() => {
          if (textRef.current) {
            setIsTruncated(textRef.current.scrollHeight > textRef.current.clientHeight);
          }
        }, 0);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [name]);

  const handleMobileClick = (e: React.MouseEvent) => {
    // Check if this is likely a mobile device (no hover capability)
    const isMobile = !window.matchMedia('(hover: hover)').matches;

    if (isMobile) {
      e.preventDefault();
      e.stopPropagation();
      setPopoverOpen(!popoverOpen);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <div
              className={`
                cursor-pointer min-w-0 min-h-[2.5rem] max-h-[2.5rem] 
                flex items-center justify-center
                ${className}
              `}
              onClick={handleMobileClick}
            >
              <div
                ref={textRef}
                className="overflow-hidden leading-tight line-clamp-2 break-words text-center"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {name}
              </div>
            </div>
          </PopoverTrigger>
          {/* Mobile: Popover on tap */}
          <PopoverContent
            className="w-auto max-w-xs p-2 text-sm break-words"
            side="top"
            align="center"
          >
            {name}
          </PopoverContent>
        </Popover>
      </TooltipTrigger>
      {/* Desktop: Tooltip on hover */}
      <TooltipContent side="top" className="max-w-xs break-words">
        {name}
      </TooltipContent>
    </Tooltip>
  );
};