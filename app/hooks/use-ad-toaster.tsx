import { useEffect } from 'react';
import { toast } from 'sonner';
import { AdBanner } from '~/components/ad-banner';
import { siteConfig } from '~/config/site-config';
import { getCookie, setCookie } from '~/lib/cookie';

const AD_TOASTER_COOKIE_NAME = 'last_ad_display_time';
const AD_DISPLAY_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes in milliseconds
const AD_URL = siteConfig.adUrl;

export const useAdToaster = () => {
  useEffect(() => {
    const handleAdDisplay = () => {
      const lastAdDisplayTime = parseInt(
        getCookie(AD_TOASTER_COOKIE_NAME) || '0',
        10,
      );
      const currentTime = Date.now();

      if (currentTime - lastAdDisplayTime >= AD_DISPLAY_INTERVAL_MS) {
        toast.custom(
          (t) => (
            <AdBanner
              title="Discover something new!"
              description="Fresh content waiting for you."
              buttonText="Let's go!"
              onClick={() => {
                window.open(AD_URL, '_blank');
                toast.dismiss(t);
              }}
            />
          ),
          {
            duration: 10 * 60 * 1000, // 10 minutes in milliseconds
            position: 'bottom-right',
          },
        );
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
