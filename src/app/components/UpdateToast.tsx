'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function UpdateToast() {
  const [newVersionAvailable, setNewVersionAvailable] = useState(false);

  useEffect(() => {
    const onSWUpdate = () => {
      setNewVersionAvailable(true);
    };
    window.addEventListener('swUpdated', onSWUpdate);
    return () => {
      window.removeEventListener('swUpdated', onSWUpdate);
    };
  }, []);

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <>
      {newVersionAvailable && (
        <div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-cyan-700 text-white py-2 px-4 rounded-full shadow-lg cursor-pointer z-[9999] animate-bounce"
          onClick={reloadPage}
        >
          🔥 New version available - Tap to refresh
        </div>
      )}

      <Script id="service-worker-registration" strategy="afterInteractive">
        {`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/service-worker.js').then(registration => {
                console.log('Service Worker registered:', registration.scope);
                registration.onupdatefound = () => {
                  const installingWorker = registration.installing;
                  installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                      if (navigator.serviceWorker.controller) {
                        window.dispatchEvent(new Event('swUpdated'));
                      }
                    }
                  };
                };
              }).catch(error => {
                console.log('Service Worker registration failed:', error);
              });
            });
          }
        `}
      </Script>
    </>
  );
}
