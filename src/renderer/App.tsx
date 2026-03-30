import { useEffect } from 'react';
import { Clock3, Link2, Power, Sparkles } from 'lucide-react';
import { PRAISE_INTERVAL_PRESETS } from '@shared/constants';
import { getElectronAPI } from './lib/ipc';
import { cn } from './lib/utils';
import Header from './components/Header';
import { useSettingsStore } from './stores/settings-store';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Separator } from './components/ui/separator';
import { Switch } from './components/ui/switch';
import { TimePickerInput } from './components/ui/time-picker-input';

function formatInterval(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分ごと`;
  }

  if (minutes % 60 === 0) {
    return `${minutes / 60}時間ごと`;
  }

  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;
  return `${hours}時間${remainMinutes}分ごと`;
}

function SectionTitle({ icon: Icon, title }: { icon: typeof Sparkles; title: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 text-primary">
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-[-0.02em] text-foreground" data-display="true">
          {title}
        </h2>
      </div>
    </div>
  );
}

export default function App() {
  const settings = useSettingsStore((state) => state.settings);
  const initialized = useSettingsStore((state) => state.initialized);
  const initialize = useSettingsStore((state) => state.initialize);
  const recordPraise = useSettingsStore((state) => state.recordPraise);
  const setIntervalMinutes = useSettingsStore((state) => state.setIntervalMinutes);
  const setActiveStartTime = useSettingsStore((state) => state.setActiveStartTime);
  const setActiveEndTime = useSettingsStore((state) => state.setActiveEndTime);
  const setLaunchAtStartup = useSettingsStore((state) => state.setLaunchAtStartup);
  const setDisableNativeNotification = useSettingsStore((state) => state.setDisableNativeNotification);
  const setWebhookUrl = useSettingsStore((state) => state.setWebhookUrl);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    const api = getElectronAPI();
    const unsubscribe = api?.onPraiseFired((event) => {
      recordPraise(event);
    });

    return () => {
      unsubscribe?.();
    };
  }, [recordPraise]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          設定を読み込んでいます
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background text-sm transition-colors duration-200">
        <Header />

        <main className="flex-1 space-y-4 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
          <section className="space-y-3">
            <SectionTitle icon={Clock3} title="通知間隔" />

            <div className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-center">
              <Label htmlFor="interval-minutes" className="text-xs text-muted-foreground">
                カスタム
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="interval-minutes"
                  type="number"
                  min={1}
                  max={1440}
                  value={settings.intervalMinutes}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value);
                    if (!Number.isNaN(nextValue)) {
                      setIntervalMinutes(nextValue);
                    }
                  }}
                  className="h-9 rounded-lg bg-background/70 px-2.5 text-sm"
                />
                <span className="shrink-0 text-xs text-muted-foreground">分ごと</span>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-start">
              <span className="pt-1 text-xs text-muted-foreground">プリセット</span>
              <div className="flex flex-wrap gap-1.5">
                {PRAISE_INTERVAL_PRESETS.map((minutes) => {
                  const active = settings.intervalMinutes === minutes;

                  return (
                    <Button
                      key={minutes}
                      type="button"
                      size="sm"
                      variant={active ? 'default' : 'outline'}
                      className={cn(
                        'h-8 rounded-full px-3 text-xs',
                        !active && 'border-white/70 bg-white/50 hover:bg-white/80',
                      )}
                      onClick={() => setIntervalMinutes(minutes)}
                    >
                      {formatInterval(minutes)}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-center">
              <Label className="text-xs text-muted-foreground">通知時間</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">開始</span>
                  <TimePickerInput
                    value={settings.activeHours.startTime}
                    onChange={setActiveStartTime}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">終了</span>
                  <TimePickerInput
                    value={settings.activeHours.endTime}
                    onChange={setActiveEndTime}
                  />
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <SectionTitle icon={Link2} title="Webhook" />

            <div className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-center">
              <Label htmlFor="webhook-url" className="text-xs text-muted-foreground">
                URL
              </Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://example.com/webhook"
                value={settings.webhook.url}
                onChange={(event) => setWebhookUrl(event.target.value)}
                className="h-9 rounded-lg bg-background/70 px-2.5 text-xs"
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/30 px-3 py-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">Webhook送信時はWindows通知を出さない</span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {settings.webhook.url.trim()
                    ? 'Webhook URLが設定されている場合のみ有効です'
                    : 'Webhook URLを設定すると選択できます'}
                </span>
              </div>
              <Switch
                checked={settings.disableNativeNotificationOnWebhook}
                disabled={!settings.webhook.url.trim()}
                onCheckedChange={setDisableNativeNotification}
              />
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <SectionTitle icon={Power} title="起動" />

            <div className="flex items-center gap-3">
              <Switch
                id="startup-switch"
                checked={settings.launchAtStartup}
                onCheckedChange={setLaunchAtStartup}
              />
              <label htmlFor="startup-switch" className="cursor-pointer select-none text-sm text-foreground">
                Windows起動時に自動起動
              </label>
            </div>
          </section>
        </main>
    </div>
  );
}
