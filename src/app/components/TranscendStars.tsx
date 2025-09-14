"use client"

import Image from "next/image"
import { motion } from "framer-motion"

const starPaths: Record<string, string> = {
  yellow: "/images/ui/CM_icon_star_y.webp",
  orange: "/images/ui/CM_icon_star_o.webp",
  red: "/images/ui/CM_icon_star_r.webp",
  purple: "/images/ui/CM_icon_star_v.webp",
  white: "/images/ui/CM_icon_star_w.webp",
}

export default function Star({
  color = "yellow",
  size = 32,
  animate = false,
}: {
  color?: keyof typeof starPaths
  size?: number
  animate?: boolean
}) {
  const img = (
    <Image
      src={starPaths[color]}
      alt={`${color} Star`}
      width={size}
      height={size}
      className="object-contain"
    />
  )

  if (!animate) return img

  return (
    <motion.div
      animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: size, height: size }}
    >
      {img}
    </motion.div>
  )
}