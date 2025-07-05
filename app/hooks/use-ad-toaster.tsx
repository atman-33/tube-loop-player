import { useEffect } from 'react';
import { toast } from 'sonner';
import { AdBanner } from '~/components/ad-banner';
import { siteConfig } from '~/config/site-config';
import { getCookie, setCookie } from '~/lib/cookie';

const AD_TOASTER_COOKIE_NAME = 'last_ad_display_time';
const AD_DISPLAY_INTERVAL_MS = 30 * 60 * 1000; // 30 min
const AD_TOAST_ID = 'ad-banner-toast'; // Fixed ID
const AD_URL = siteConfig.adUrl;

export const useAdToaster = () => {
  useEffect(() => {
    const shouldShowAd = () => {
      const lastTime = Number(getCookie(AD_TOASTER_COOKIE_NAME) || '0');
      return Date.now() - lastTime >= AD_DISPLAY_INTERVAL_MS;
    };

    const showAd = () => {
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
          id: AD_TOAST_ID, // If there's an existing toast with the same ID, it will be updated.
          duration: Infinity,
          position: 'bottom-right',
          onDismiss: () =>
            setCookie(AD_TOASTER_COOKIE_NAME, Date.now().toString(), 365),
          onAutoClose: () =>
            setCookie(AD_TOASTER_COOKIE_NAME, Date.now().toString(), 365),
        },
      );
    };

    const handleAdDisplay = () => {
      if (shouldShowAd()) {
        showAd();
      }
    };

    // Initial check
    handleAdDisplay();

    // Recheck every 1 minute
    const id = setInterval(handleAdDisplay, 60 * 1000);
    return () => clearInterval(id);
  }, []);
};
