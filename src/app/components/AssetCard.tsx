/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";

type Props = {
    label: string;
    srcBase: string; // sans extension
    displaySize?: number; // optionnel
};

export default function AssetCard({ label, srcBase, displaySize }: Props) {
    const [webpSize, setWebpSize] = useState("");
    const [pngSize, setPngSize] = useState("");
    const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);

    const webp = `${srcBase}.webp`;
    const png = `${srcBase}.png`;

    useEffect(() => {
        // get .webp size
        fetch(webp)
            .then((res) => res.ok ? res.blob() : null)
            .then((blob) => {
                if (blob) {
                    const kb = blob.size / 1024;
                    setWebpSize(kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`);
                }
            });

        // get .png size
        fetch(png)
            .then((res) => res.ok ? res.blob() : null)
            .then((blob) => {
                if (blob) {
                    const kb = blob.size / 1024;
                    setPngSize(kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`);
                }
            });

        // get image dimensions (via webp)
        const img = new window.Image();
        img.src = webp;
        img.onload = () => setDimensions({ w: img.naturalWidth, h: img.naturalHeight });
    }, [webp, png]);

    return (
        <div className="text-center bg-card border p-3 rounded-xl">
            <img
                src={webp}
                alt={label}
                className={`mx-auto rounded object-contain transition-all duration-200 ease-in-out ${!dimensions && !displaySize ? "opacity-0" : "opacity-100"
                    }`}
                style={
                    displaySize
                        ? { width: `${displaySize}px`, height: `${displaySize}px` }
                        : dimensions
                            ? { width: `${dimensions.w}px`, height: "auto", maxWidth: "100%" }
                            : {}
                }
            />




            <p className="text-sm text-white mt-2">{label}</p>
            <p className="text-xs text-muted-foreground">
                {dimensions ? `${dimensions.w}×${dimensions.h}` : "…"}
            </p>

            <div className="text-xs text-muted-foreground mt-1">
                <a href={png} download className="hover:underline text-primary">
                    .png {pngSize && `(${pngSize})`}
                </a>
                <br />
                <a href={webp} download className="hover:underline text-primary">
                    .webp {webpSize && `(${webpSize})`}
                </a>
            </div>


        </div>
    );
}
