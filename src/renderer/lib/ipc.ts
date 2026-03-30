import type { PraiseEvent, PraisePreferences } from '@shared/praise';
import type { Reminder } from '../types/reminder';
import type { AppSettings } from '../types/reminder';

// window.electronAPI の型定義 (preloadで提供)
export interface ElectronAPI {
  syncPraiseSettings(settings: PraisePreferences): Promise<void>;
  onPraiseFired(callback: (event: PraiseEvent) => void): () => void;
  triggerPraiseNow(): Promise<PraiseEvent | null>;

  syncReminders(reminders: Reminder[]): Promise<void>;
  onReminderFired(callback: (id: string) => void): () => void;
  onFocusReminder(callback: (id: string) => void): () => void;
  getAutoLaunch(): Promise<boolean>;
  setAutoLaunch(enabled: boolean): Promise<void>;
  getNativeTheme(): Promise<'light' | 'dark'>;
  onThemeChanged(callback: (theme: 'light' | 'dark') => void): () => void;
  minimizeWindow(): Promise<void>;
  maximizeWindow(): Promise<void>;
  closeWindow(): Promise<void>;
}

// AppSettings は再エクスポート (他モジュールからの参照用)
export type { AppSettings };
export type { PraisePreferences, PraiseEvent };

/**
 * ElectronAPIのアクセサ
 * 開発環境でwindow.electronAPIが未定義の場合はnullを返す
 */
export function getElectronAPI(): ElectronAPI | null {
  return (window as typeof window & { electronAPI?: ElectronAPI }).electronAPI ?? null;
}

export async function syncPraiseSettingsToMain(settings: PraisePreferences): Promise<void> {
  await getElectronAPI()?.syncPraiseSettings(settings);
}

export async function triggerPraiseNow(): Promise<PraiseEvent | null> {
  return (await getElectronAPI()?.triggerPraiseNow()) ?? null;
}

export async function syncRemindersToMain(reminders: Reminder[]): Promise<void> {
  await getElectronAPI()?.syncReminders(reminders);
}

export async function getAutoLaunch(): Promise<boolean> {
  return (await getElectronAPI()?.getAutoLaunch()) ?? false;
}

export async function setAutoLaunch(enabled: boolean): Promise<void> {
  await getElectronAPI()?.setAutoLaunch(enabled);
}

export async function getNativeTheme(): Promise<'light' | 'dark'> {
  return (await getElectronAPI()?.getNativeTheme()) ?? 'light';
}

export async function minimizeWindow(): Promise<void> {
  await getElectronAPI()?.minimizeWindow();
}

export async function maximizeWindow(): Promise<void> {
  await getElectronAPI()?.maximizeWindow();
}

export async function closeWindow(): Promise<void> {
  await getElectronAPI()?.closeWindow();
}
