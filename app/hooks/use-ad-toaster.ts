import { useEffect } from 'react';
import { toast } from 'sonner';
import { getCookie, setCookie } from '~/lib/cookie';

const AD_TOASTER_COOKIE_NAME = 'last_ad_display_time';
const AD_DISPLAY_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes in milliseconds
const AD_URL = 'https://otieu.com/4/9519912';

export const useAdToaster = () => {
  useEffect(() => {
    const handleAdDisplay = () => {
      const lastAdDisplayTime = parseInt(
        getCookie(AD_TOASTER_COOKIE_NAME) || '0',
        10,
      );
      const currentTime = Date.now();

      if (currentTime - lastAdDisplayTime >= AD_DISPLAY_INTERVAL_MS) {
        toast('Check out recommended sites!', {
          description: 'Click to explore new content.',
          action: {
            label: 'Go',
            onClick: () => window.open(AD_URL, '_blank'),
          },
          duration: 5000, // Display for 5 seconds
        });
        setCookie(AD_TOASTER_COOKIE_NAME, currentTime.toString(), 365); // Store for 1 year
      }
    };

    // Check immediately on mount
    handleAdDisplay();

    // Set up an interval to check periodically (e.g., every minute)
    const intervalId = setInterval(handleAdDisplay, 60 * 1000); // Check every minute

    return () => clearInterval(intervalId);
  }, []);
};
