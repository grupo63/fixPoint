"use client";
import * as React from "react";

type Props = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function DashboardCard({ title, children, className = "" }: Props) {
  return (
    <section className={`rounded-lg border p-4 bg-white ${className}`}>
      {title && <h3 className="font-semibold mb-2">{title}</h3>}
      {children}
    </section>
  );
}

export default DashboardCard;
