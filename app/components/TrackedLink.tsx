"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackEvent } from "@/app/components/Analytics";

type Props = {
  href: string;
  event: string;
  data?: Record<string, string | number | boolean>;
  className?: string;
  children: ReactNode;
  external?: boolean;
};

export function TrackedLink({ href, event, data, className, children, external = false }: Props) {
  const onClick = () => trackEvent(event, data);
  if (external) return <a className={className} href={href} target="_blank" rel="noreferrer" onClick={onClick}>{children}</a>;
  return <Link className={className} href={href} onClick={onClick}>{children}</Link>;
}
