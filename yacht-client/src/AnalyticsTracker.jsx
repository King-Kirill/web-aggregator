import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname + location.search;
    window.gtag('config', 'your g-code', {
      page_path: path,
      page_title: document.title,
    });
    // здесь вводится код яндекс трекера
    window.ym?.('hit', window.location.href);
  }, [location]);

  return null;
};