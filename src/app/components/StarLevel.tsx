'use client';

import Image from 'next/image';

const starIcons = {
  gray: "/images/ui/CM_icon_star_w.webp",
  yellow: "/images/ui/CM_icon_star_y.webp",
  orange: "/images/ui/CM_icon_star_o.webp",
  red: "/images/ui/CM_icon_star_r.webp",
  purple: "/images/ui/CM_icon_star_v.webp",
};

export default function StarLevel({
  levelLabel,
  size = 18,
  blank = false,
}: {
  levelLabel: string;
  size?: number;
  blank?: boolean;
}) {
  const active: string[] = [];

  switch (levelLabel) {
    case "1":     active.push(...Array(1).fill(starIcons.yellow)); break;
    case "2":     active.push(...Array(2).fill(starIcons.yellow)); break;
    case "3":     active.push(...Array(3).fill(starIcons.yellow)); break;
    case "4":     active.push(...Array(4).fill(starIcons.yellow)); break;
    case "4+":    active.push(...Array(3).fill(starIcons.yellow), starIcons.orange); break;
    case "5":     active.push(...Array(5).fill(starIcons.yellow)); break;
    case "5+":    active.push(...Array(4).fill(starIcons.yellow), starIcons.red); break;
    case "5++":   active.push(...Array(4).fill(starIcons.yellow), starIcons.purple); break;
    case "6":     active.push(...Array(6).fill(starIcons.yellow)); break;
    default:      break;
  }

  const stars = blank
    ? [...active, ...Array(6 - active.length).fill(starIcons.gray)]
    : active;

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
