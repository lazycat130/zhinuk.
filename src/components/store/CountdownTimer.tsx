import { useEffect, useState } from "react";
import { Clock, Sparkles } from "lucide-react";
import { dataService } from "@/lib/data-service";
import { toBn } from "@/lib/catalog";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

function calculateTimeLeft(deadlineIso: string): TimeLeft {
  const diff = new Date(deadlineIso).getTime() - Date.now();
  if (diff <= 0 || isNaN(diff)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, expired: false };
}

export function CountdownTimer({ compact = false }: { compact?: boolean }) {
  const settings = dataService.getSettings();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(settings.promoDeadline));

  useEffect(() => {
    if (!settings.promoOfferEnabled) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(settings.promoDeadline));
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.promoDeadline, settings.promoOfferEnabled]);

  if (!settings.promoOfferEnabled || timeLeft.expired) {
    return null;
  }

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-highlight/15 px-3 py-1 text-xs font-semibold text-highlight">
        <Clock className="h-3.5 w-3.5 animate-spin-slow" />
        <span>অফার শেষ হতে বাকি:</span>
        <span className="font-mono font-bold">
          {timeLeft.days > 0 && `${toBn(timeLeft.days)} দিন `}
          {toBn(String(timeLeft.hours).padStart(2, "0"))}:{toBn(String(timeLeft.minutes).padStart(2, "0"))}:{toBn(String(timeLeft.seconds).padStart(2, "0"))}
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-highlight/30 bg-gradient-to-r from-highlight/10 via-pearl to-ocean-soft p-3.5 shadow-sm sm:p-4">
      <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-highlight text-highlight-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-highlight">সীমিত সময়ের প্রমোশন</p>
            <p className="text-sm font-bold text-navy">{settings.promoTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {timeLeft.days > 0 && (
            <TimeBlock value={timeLeft.days} label="দিন" />
          )}
          <TimeBlock value={timeLeft.hours} label="ঘণ্টা" />
          <span className="font-bold text-navy">:</span>
          <TimeBlock value={timeLeft.minutes} label="মিনিট" />
          <span className="font-bold text-navy">:</span>
          <TimeBlock value={timeLeft.seconds} label="সেকেন্ড" />
        </div>
      </div>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  const pad = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <span className="grid h-8 min-w-8 place-items-center rounded-lg bg-navy font-mono text-xs font-bold text-navy-foreground shadow-xs px-1">
        {toBn(pad)}
      </span>
      <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
}
