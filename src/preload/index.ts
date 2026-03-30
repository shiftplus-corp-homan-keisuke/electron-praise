import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';
import type { PraiseEvent, PraisePreferences } from '../shared/praise';
import type { Reminder } from '../renderer/types/reminder';

contextBridge.exposeInMainWorld('electronAPI', {
  syncPraiseSettings: (settings: PraisePreferences) =>
    ipcRenderer.invoke(IPC_CHANNELS.SYNC_PRAISE_SETTINGS, settings),

  onPraiseFired: (callback: (event: PraiseEvent) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, event: PraiseEvent) => callback(event);
    ipcRenderer.on(IPC_CHANNELS.PRAISE_FIRED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.PRAISE_FIRED, listener);
  },

  triggerPraiseNow: () => ipcRenderer.invoke(IPC_CHANNELS.TRIGGER_PRAISE_NOW),

  // リマインダーをメインプロセスのスケジューラに同期
  syncReminders: (_reminders: Reminder[]) => Promise.resolve(),

  // 通知発火イベントのリスナー登録 (クリーンアップ関数を返す)
  onReminderFired: (_callback: (id: string) => void) => () => undefined,

  // 通知クリック時のフォーカスイベント
  onFocusReminder: (_callback: (id: string) => void) => () => undefined,

  // スタートアップ
  getAutoLaunch: () => ipcRenderer.invoke(IPC_CHANNELS.GET_AUTO_LAUNCH),
  setAutoLaunch: (enabled: boolean) =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_AUTO_LAUNCH, enabled),

  // システムテーマ
  getNativeTheme: () => ipcRenderer.invoke(IPC_CHANNELS.GET_NATIVE_THEME),
  onThemeChanged: (callback: (theme: 'light' | 'dark') => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      theme: 'light' | 'dark'
    ) => callback(theme);
    ipcRenderer.on(IPC_CHANNELS.THEME_CHANGED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.THEME_CHANGED, listener);
  },

  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
  closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
});
