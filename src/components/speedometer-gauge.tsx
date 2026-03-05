"use client";

import { useEffect, useRef, useState } from "react";

interface SpeedometerGaugeProps {
  value: number;
  label: string;
  maxValue?: number;
  compact?: boolean;
}

function getGaugeColor(rating: number): string {
  if (rating >= 85) return "#E8A838";
  if (rating >= 75) return "#D4A03A";
  if (rating >= 65) return "#FACC15";
  if (rating >= 50) return "#FB923C";
  return "#EF4444";
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function SpeedometerGauge({
  value,
  label,
  maxValue = 100,
  compact,
}: SpeedometerGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const duration = 1200;

  useEffect(() => {
    startTimeRef.current = 0;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      setAnimatedValue(Math.round(eased * value));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  const percentage = Math.min(Math.max(animatedValue / maxValue, 0), 1);
  const angle = percentage * 180;
  const color = getGaugeColor(value);

  const radius = compact ? 30 : 45;
  const strokeWidth = compact ? 6 : 8;
  const svgW = compact ? 80 : 120;
  const svgH = compact ? 50 : 80;
  const centerX = svgW / 2;
  const centerY = svgH;

  const startAngle = 180;
  const endAngle = 180 + angle;

  const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
  const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
  const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
  const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

  const largeArcFlag = angle > 180 ? 1 : 0;

  return (
    <div className={`bg-white/5 rounded-lg border border-white/10 flex flex-col items-center justify-center ${compact ? "p-2" : "p-4 rounded-xl"}`}>
      <p className={`text-gray-400 uppercase tracking-wide ${compact ? "text-[10px] mb-1" : "text-xs mb-2"}`}>
        {label}
      </p>
      <div className={`relative flex items-end justify-center ${compact ? "w-[80px] h-[50px]" : "w-[120px] h-[80px]"}`}>
        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="overflow-visible"
        >
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {angle > 0 && (
            <path
              d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          )}
        </svg>
        <div className={`absolute left-1/2 -translate-x-1/2 ${compact ? "bottom-0" : "bottom-2"}`}>
          <span className={`font-black ${compact ? "text-lg" : "text-3xl"}`} style={{ color }}>
            {animatedValue}
          </span>
        </div>
      </div>
    </div>
  );
}
