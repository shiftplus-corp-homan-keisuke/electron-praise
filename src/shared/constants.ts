import type { PraisePreferences } from './praise';

export const IPC_CHANNELS = {
  SYNC_REMINDERS: 'sync-reminders',   // Renderer → Main: リマインダー一覧をスケジューラへ同期
  REMINDER_FIRED: 'reminder-fired',   // Main → Renderer: 通知発火をUIに伝達
  SYNC_PRAISE_SETTINGS: 'sync-praise-settings', // Renderer → Main: 褒め設定をスケジューラへ同期
  PRAISE_FIRED: 'praise-fired',       // Main → Renderer: 褒め通知の発火をUIに伝達
  TRIGGER_PRAISE_NOW: 'trigger-praise-now', // Renderer → Main: 手動で褒め通知を発火
  GET_AUTO_LAUNCH: 'get-auto-launch', // Renderer → Main: スタートアップ状態取得
  SET_AUTO_LAUNCH: 'set-auto-launch', // Renderer → Main: スタートアップ登録/解除
  GET_NATIVE_THEME: 'get-native-theme', // Renderer → Main: システムテーマ取得
  THEME_CHANGED: 'theme-changed',     // Main → Renderer: テーマ変更通知
  WINDOW_MINIMIZE: 'window-minimize', // Renderer → Main: ウィンドウ最小化
  WINDOW_MAXIMIZE: 'window-maximize', // Renderer → Main: ウィンドウ最大化切替
  WINDOW_CLOSE: 'window-close',       // Renderer → Main: ウィンドウを閉じる
  SHOW_WINDOW: 'show-window',         // Main内部: ウィンドウ表示
  FOCUS_REMINDER: 'focus-reminder',   // Main → Renderer: 通知クリック時にリマインダーにフォーカス
} as const;

export const DEFAULT_SETTINGS = {
  launchAtStartup: false,
  theme: 'system' as const,
};

export const DEFAULT_PRAISE_SETTINGS: PraisePreferences = {
  enabled: true,
  intervalMinutes: 60,
  launchAtStartup: false,
  theme: 'system',
  activeHours: {
    startTime: '00:00',
    endTime: '23:59',
  },
  disableNativeNotificationOnWebhook: false,
  webhook: {
    enabled: false,
    url: '',
  },
};

export const PRAISE_INTERVAL_PRESETS = [15, 30, 60, 120, 180, 240] as const;

export const NOTIFICATION_ICON_DIRECTORY = 'notification-icons';

export const SUPPORTED_NOTIFICATION_ICON_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.ico',
] as const;
