'use client';

import { useEffect } from 'react';

interface UmamiAnalyticsProps {
  websiteId: string;
  src?: string;
  hostUrl?: string;
}

const UmamiAnalytics: React.FC<UmamiAnalyticsProps> = ({
  websiteId,
  src = 'https://umami.51xmi.com/script.js',
  hostUrl
}) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = src;
    script.setAttribute('data-website-id', websiteId);
    if (hostUrl) {
      script.setAttribute('data-host-url', hostUrl);
    }
    
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [websiteId, src, hostUrl]);

  return null;
};

export default UmamiAnalytics;