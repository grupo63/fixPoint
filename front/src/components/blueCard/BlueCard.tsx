import * as React from "react";

type BlueCardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function BlueCard({ children, className = "" }: BlueCardProps) {
  return (
    <div
      className={`w-64 h-[400px] rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg p-4 text-center ${className}`}
    >
      {children}
    </div>
  );
}