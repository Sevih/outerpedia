'use client';

import Image from 'next/image';

const starIcons = {
  gray: "/images/ui/CM_icon_star_w.webp",
  yellow: "/images/ui/CM_icon_star_y.webp",
  orange: "/images/ui/CM_icon_star_o.webp",
  red: "/images/ui/CM_icon_star_r.webp",
  purple: "/images/ui/CM_icon_star_v.webp",
};

export default function StarLevelItem({
  orange = 0,
  yellow = 0,
  size = 18,
}: {
  orange?: number;
  yellow?: number;
  size?: number;
  blank?: boolean;
}) {
  const stars = [
    ...Array(orange).fill(starIcons.orange),
    ...Array(yellow).fill(starIcons.yellow),
  ];

  return (
    <span className="inline-flex align-middle">
      {stars.map((src, idx) => (
        <span key={idx} className={idx > 0 ? "-ml-1" : ""}>
          <Image
            src={src}
            alt="star"
            width={size}
            height={size}
            style={{ width: size, height: size }}
            className="object-contain"
          />
        </span>
      ))}
    </span>
  );
}
