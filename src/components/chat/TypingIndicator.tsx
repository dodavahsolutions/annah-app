"use client"

import { motion, type Variants } from "framer-motion"
import { useTenant } from "@/context/TenantContext"

const container: Variants = {
  animate: { transition: { staggerChildren: 0.14 } },
}

const dot: Variants = {
  animate: {
    y: [0, -5, 0],
    transition: { duration: 0.45, repeat: Infinity, ease: "easeInOut" },
  },
}

export function TypingIndicator() {
  const tenant = useTenant()

  return (
    <div className="mb-[28px] flex gap-[10px]">
      <div className="avatar-circle font-display mt-[1px] grid h-[28px] w-[28px] flex-shrink-0 place-items-center rounded-full text-[12px]">
        {tenant.avatarInitial}
      </div>
      <div className="flex-1">
        <div className="mb-[4px] text-[12px] font-medium text-text-secondary">
          {tenant.assistantName}
        </div>
        <motion.div
          className="flex items-center gap-[4px] py-[6px]"
          variants={container}
          animate="animate"
          aria-label={`${tenant.assistantName} is typing`}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              variants={dot}
              className="h-[6px] w-[6px] rounded-full bg-text-secondary"
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
