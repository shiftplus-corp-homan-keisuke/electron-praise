import type { PraisePreferences, PraiseSource } from '../shared/praise';

const MINUTES_PER_DAY = 24 * 60;

function parseTimeToMinutes(value: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(value);

  if (!match) {
    return 0;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return Math.min(MINUTES_PER_DAY - 1, Math.max(0, hours * 60 + minutes));
}

function getMinutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function setTimeOnDate(base: Date, minutesOfDay: number): Date {
  const next = new Date(base);
  next.setHours(Math.floor(minutesOfDay / 60), minutesOfDay % 60, 0, 0);
  return next;
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function isWithinActiveHours(date: Date, settings: PraisePreferences): boolean {
  const startMinutes = parseTimeToMinutes(settings.activeHours.startTime);
  const endMinutes = parseTimeToMinutes(settings.activeHours.endTime);

  if (startMinutes === endMinutes) {
    return true;
  }

  const currentMinutes = getMinutesOfDay(date);

  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
}

function getNextActiveStart(date: Date, settings: PraisePreferences): Date {
  const startMinutes = parseTimeToMinutes(settings.activeHours.startTime);
  const currentMinutes = getMinutesOfDay(date);

  if (currentMinutes < startMinutes) {
    return setTimeOnDate(date, startMinutes);
  }

  return setTimeOnDate(addDays(date, 1), startMinutes);
}

function getNextFireDate(now: Date, settings: PraisePreferences): Date {
  if (!isWithinActiveHours(now, settings)) {
    return getNextActiveStart(now, settings);
  }

  const candidate = new Date(now.getTime() + Math.max(1, settings.intervalMinutes) * 60_000);

  if (isWithinActiveHours(candidate, settings)) {
    return candidate;
  }

  return getNextActiveStart(candidate, settings);
}

export class Scheduler {
  private settings: PraisePreferences | null = null;
  private timer: NodeJS.Timeout | null = null;
  private onFireCallback: ((source: PraiseSource) => void | Promise<void>) | null = null;

  start(onFire: (source: PraiseSource) => void | Promise<void>): void {
    this.onFireCallback = onFire;
  }

  stop(): void {
    this.clearTimer();
  }

  updateSettings(settings: PraisePreferences): void {
    this.settings = settings;
    this.scheduleNext();
  }

  async triggerNow(): Promise<void> {
    await this.onFireCallback?.('manual');
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private scheduleNext(): void {
    this.clearTimer();

    if (!this.settings?.enabled) {
      return;
    }

    const delayMs = Math.max(1000, getNextFireDate(new Date(), this.settings).getTime() - Date.now());

    this.timer = setTimeout(() => {
      void this.fireScheduledPraise();
    }, delayMs);
  }

  private async fireScheduledPraise(): Promise<void> {
    await this.onFireCallback?.('scheduled');
    this.scheduleNext();
  }
}
