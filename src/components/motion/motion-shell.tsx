"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type MotionWrapperProps = {
  children: ReactNode;
  className?: string;
};

function isAnimationDisabled(pathname: string) {
  return pathname.startsWith("/admin");
}

export function MotionPage({ children, className }: MotionWrapperProps) {
  const pathname = usePathname();

  if (isAnimationDisabled(pathname)) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      key={pathname}
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function MotionReveal({ children, className }: MotionWrapperProps) {
  const pathname = usePathname();

  if (isAnimationDisabled(pathname)) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
