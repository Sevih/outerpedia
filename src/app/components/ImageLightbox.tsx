'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';

interface ImageLightboxProps {
    src: string;
    alt: string;
    className?: string;
    thumbnailClassName?: string;
    size?: 'sm' | 'md' | 'lg';
    caption?: string;
}

const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
};

export default function ImageLightbox({ src, alt, className = '', thumbnailClassName = '', size, caption }: ImageLightboxProps) {
    const [isOpen, setIsOpen] = useState(false);

    const openLightbox = useCallback(() => setIsOpen(true), []);
    const closeLightbox = useCallback(() => setIsOpen(false), []);

    const sizeClass = size ? sizeClasses[size] : '';

    return (
        <div className="flex flex-col items-center">
            {/* Thumbnail */}
            <div
                className={`relative cursor-pointer hover:opacity-90 transition-opacity ${sizeClass} ${className}`}
                onClick={openLightbox}
            >
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className={`object-contain ${thumbnailClassName}`}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                    <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                </div>
            </div>
            {caption && (
                <p className="text-xs text-gray-400 mt-1 text-center max-w-[10rem]">{caption}</p>
            )}

            {/* Lightbox Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 cursor-pointer"
                    onClick={closeLightbox}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50"
                        onClick={closeLightbox}
                        aria-label="Close"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="relative w-[90vw] h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={src}
                            alt={alt}
                            fill
                            className="object-contain"
                            sizes="90vw"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
