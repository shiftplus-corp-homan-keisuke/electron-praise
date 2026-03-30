import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PraiseEvent, PraisePreferences, ThemeMode } from '@shared/praise';
import { DEFAULT_PRAISE_SETTINGS } from '@shared/constants';
import { dexieStorage } from '../lib/dexie-storage';
import {
  getAutoLaunch,
  setAutoLaunch,
  syncPraiseSettingsToMain,
} from '../lib/ipc';

function normalizeSettings(settings?: Partial<PraisePreferences>): PraisePreferences {
  return {
    ...DEFAULT_PRAISE_SETTINGS,
    ...settings,
    activeHours: {
      ...DEFAULT_PRAISE_SETTINGS.activeHours,
      ...settings?.activeHours,
    },
    webhook: {
      ...DEFAULT_PRAISE_SETTINGS.webhook,
      ...settings?.webhook,
    },
  };
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

interface SettingsState {
  settings: PraisePreferences;
  initialized: boolean;
  lastPraise: PraiseEvent | null;
  recentPraises: PraiseEvent[];

  setTheme(theme: ThemeMode): void;
  setEnabled(enabled: boolean): void;
  setIntervalMinutes(minutes: number): void;
  setActiveStartTime(time: string): void;
  setActiveEndTime(time: string): void;
  setLaunchAtStartup(enabled: boolean): void;
  setDisableNativeNotification(disabled: boolean): void;
  setWebhookEnabled(enabled: boolean): void;
  setWebhookUrl(url: string): void;
  recordPraise(event: PraiseEvent): void;
  initialize(): Promise<void>;
  syncToMain(): Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => {
      const updateSettings = (updater: (settings: PraisePreferences) => PraisePreferences): void => {
        set((state) => ({
          settings: updater(state.settings),
        }));

        void get().syncToMain();
      };

      return {
        settings: DEFAULT_PRAISE_SETTINGS,
        initialized: false,
        lastPraise: null,
        recentPraises: [],

        setTheme(theme) {
          updateSettings((settings) => ({ ...settings, theme }));
        },

        setEnabled(enabled) {
          updateSettings((settings) => ({ ...settings, enabled }));
        },

        setIntervalMinutes(minutes) {
          const safeMinutes = Math.min(24 * 60, Math.max(1, Math.round(minutes)));
          updateSettings((settings) => ({ ...settings, intervalMinutes: safeMinutes }));
        },

        setActiveStartTime(time) {
          if (!isValidTime(time)) return;

          updateSettings((settings) => ({
            ...settings,
            activeHours: {
              ...settings.activeHours,
              startTime: time,
            },
          }));
        },

        setActiveEndTime(time) {
          if (!isValidTime(time)) return;

          updateSettings((settings) => ({
            ...settings,
            activeHours: {
              ...settings.activeHours,
              endTime: time,
            },
          }));
        },

        setLaunchAtStartup(enabled) {
          updateSettings((settings) => ({ ...settings, launchAtStartup: enabled }));

          setAutoLaunch(enabled).catch((error) => {
            console.error('[SettingsStore] setAutoLaunch failed:', error);
          });
        },

        setDisableNativeNotification(disabled) {
          updateSettings((settings) => ({
            ...settings,
            disableNativeNotificationOnWebhook: disabled,
          }));
        },

        setWebhookEnabled(enabled) {
          updateSettings((settings) => ({
            ...settings,
            webhook: {
              ...settings.webhook,
              enabled,
            },
          }));
        },

        setWebhookUrl(url) {
          updateSettings((settings) => ({
            ...settings,
            webhook: {
              ...settings.webhook,
              url,
            },
          }));
        },

        recordPraise(event) {
          set((state) => ({
            lastPraise: event,
            recentPraises: [event, ...state.recentPraises.filter((item) => item.id !== event.id)].slice(
              0,
              6,
            ),
          }));
        },

        async initialize() {
          try {
            const launchAtStartup = await getAutoLaunch();

            set((state) => ({
              settings: {
                ...state.settings,
                launchAtStartup,
              },
              initialized: true,
            }));
          } catch (error) {
            console.error('[SettingsStore] initialize failed:', error);
            set({ initialized: true });
          }

          await get().syncToMain();
        },

        async syncToMain() {
          await syncPraiseSettingsToMain(get().settings);
        },
      };
    },
    {
      name: 'praise-settings-storage',
      storage: dexieStorage,
      partialize: (state) => ({
        settings: state.settings,
      }),
      merge: (persistedState, currentState) => {
        const typedState = persistedState as Partial<SettingsState> | undefined;

        return {
          ...currentState,
          ...typedState,
          settings: normalizeSettings(typedState?.settings),
        };
      },
    },
  ),
);
