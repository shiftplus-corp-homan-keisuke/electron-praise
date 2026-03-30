export type ThemeMode = 'light' | 'dark' | 'system';

export interface PraiseWebhookSettings {
  enabled: boolean;
  url: string;
}

export interface PraiseActiveHours {
  startTime: string;
  endTime: string;
}

export interface PraisePreferences {
  enabled: boolean;
  intervalMinutes: number;
  launchAtStartup: boolean;
  theme: ThemeMode;
  webhook: PraiseWebhookSettings;
  disableNativeNotificationOnWebhook: boolean;
  activeHours: PraiseActiveHours;
}

export type PraiseSource = 'scheduled' | 'manual';

export interface PraiseEvent {
  id: string;
  title: string;
  message: string;
  firedAt: string;
  source: PraiseSource;
  iconPath?: string;
}
