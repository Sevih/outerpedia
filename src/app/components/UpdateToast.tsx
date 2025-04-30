'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { APP_VERSION } from '@/utils/version';

export default function UpdateToast() {
  const [newVersionAvailable, setNewVersionAvailable] = useState(false)

  useEffect(() => {
    const onSWUpdate = () => {
      console.log('🔥 New version detected!')
      setNewVersionAvailable(true)

      // ⏱️ Auto-reload après 5 secondes
      setTimeout(() => {
        window.location.reload()
      }, 5000)
    }

    window.addEventListener('swUpdated', onSWUpdate)
    return () => {
      window.removeEventListener('swUpdated', onSWUpdate)
    }
  }, [])

  const reloadPage = () => {
    window.location.reload()
  }

  return (
    <>
      {newVersionAvailable && (
        <div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-cyan-700 text-white py-2 px-4 rounded-full shadow-lg cursor-pointer z-[9999] animate-bounce"
          onClick={reloadPage}
        >
          <div className="text-xs text-center mt-1 text-gray-300">
            App version: v{APP_VERSION}
          </div>
          🔥 New version available – Refreshing...
        </div>
      )}

      <Script id="service-worker-registration" strategy="afterInteractive">
        {`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/service-worker.js').then(registration => {
                console.log('✅ Service Worker registered:', registration.scope);

                if (registration.waiting) {
                  console.log('🔄 New version ready (waiting)');
                  window.dispatchEvent(new Event('swUpdated'));
                  return;
                }

                registration.onupdatefound = () => {
                  const installingWorker = registration.installing;
                  installingWorker.onstatechange = () => {
                    if (
                      installingWorker.state === 'installed' &&
                      navigator.serviceWorker.controller
                    ) {
                      console.log('🆕 New version installed via onupdatefound');
                      window.dispatchEvent(new Event('swUpdated'));
                    }
                  };
                };
              }).catch(error => {
                console.log('❌ SW registration failed:', error);
              });
            });
          }
        `}
      </Script>
    </>
  )
}
