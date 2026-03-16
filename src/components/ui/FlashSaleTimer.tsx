'use client';

import { useState, useEffect } from 'react';
import { formatCountdown } from '@/lib/utils';

interface FlashSaleTimerProps {
  endTime: Date;
  onExpire?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FlashSaleTimer({ endTime, onExpire, size = 'md', className = '' }: FlashSaleTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: '00', minutes: '00', seconds: '00'
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const end = endTime.getTime();
      const diff = end - now;

      if (diff <= 0) {
        setIsExpired(true);
        onExpire?.();
        return;
      }

      setTimeLeft(formatCountdown(diff));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  if (isExpired) {
    return <span className="badge-danger text-xs">Terminé</span>;
  }

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2',
  };

  const unitSizeClasses = {
    sm: 'min-w-[28px] px-1.5 py-1',
    md: 'min-w-[36px] px-2 py-1',
    lg: 'min-w-[44px] px-2.5 py-1.5',
  };

  return (
    <div className={`flash-timer ${sizeClasses[size]} ${className}`}>
      <span className="text-white/60 text-xs mr-1">⏱</span>
      <TimerUnit value={timeLeft.hours} label="h" sizeClass={unitSizeClasses[size]} />
      <span className="text-chapchap-accent font-bold animate-pulse">:</span>
      <TimerUnit value={timeLeft.minutes} label="m" sizeClass={unitSizeClasses[size]} />
      <span className="text-chapchap-accent font-bold animate-pulse">:</span>
      <TimerUnit value={timeLeft.seconds} label="s" sizeClass={unitSizeClasses[size]} />
    </div>
  );
}

function TimerUnit({ value, label, sizeClass }: { value: string; label: string; sizeClass: string }) {
  return (
    <div className={`flash-timer-unit ${sizeClass} text-center`}>
      <span className="font-bold tabular-nums leading-none">{value}</span>
      <span className="text-2xs text-white/60 leading-none">{label}</span>
    </div>
  );
}

// Version inline (pour cards produits)
export function FlashSaleTimerInline({ endTime }: { endTime: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const diff = endTime.getTime() - Date.now();
      if (diff <= 0) { setIsExpired(true); return; }
      setTimeLeft(formatCountdown(diff));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (isExpired) return null;

  return (
    <span className="text-2xs font-mono font-bold text-red-500">
      ⚡ {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
    </span>
  );
}
