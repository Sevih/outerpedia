'use client';

import React from 'react';
import Link from 'next/link';

const MonadIncompleteNotice = () => (
  <div className="bg-yellow-100 border border-yellow-300 text-yellow-900 px-4 py-3 rounded-lg shadow text-sm md:text-base">
    ⚠️ This map is not yet complete. You can help improve it by contributing on our{" "}
    <Link
      href="https://discord.com/invite/keGhVQWsHv"
      className="text-blue-700 font-semibold underline hover:text-blue-900"
      target="_blank"
      rel="noopener noreferrer"
    >
      EvaMains Discord
    </Link>
    .
  </div>
);

export default MonadIncompleteNotice;
