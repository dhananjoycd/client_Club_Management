"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { SiteFaqItem } from "@/types/settings.types";

type FaqAccordionProps = {
  items: SiteFaqItem[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = index === openIndex;

        return (
          <div key={`${item.question}-${index}`} className="overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-white/60">
            <button
              type="button"
              onClick={() => setOpenIndex((current) => (current === index ? -1 : index))}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
            >
              <span className="text-base font-semibold text-[var(--color-primary-strong)] sm:text-lg">{item.question}</span>
              <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-secondary)]">
                <ChevronDown className="h-5 w-5" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-[var(--color-border)] px-5 py-4 sm:px-6 sm:py-5">
                    <p className="text-sm leading-7 text-[var(--color-muted-foreground)] sm:text-base">{item.answer}</p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
