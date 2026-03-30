import { Notification, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import type { PraiseEvent } from '../shared/praise';
import {
  NOTIFICATION_ICON_DIRECTORY,
  SUPPORTED_NOTIFICATION_ICON_EXTENSIONS,
} from '../shared/constants';
import { resolveResourcePath } from './resource-paths';

export function getRandomNotificationIconPath(): string | undefined {
  const iconDirectory = resolveResourcePath(NOTIFICATION_ICON_DIRECTORY);

  if (fs.existsSync(iconDirectory)) {
    const candidates = fs
      .readdirSync(iconDirectory, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isFile() &&
          SUPPORTED_NOTIFICATION_ICON_EXTENSIONS.some((extension) =>
            entry.name.toLowerCase().endsWith(extension),
          ),
      )
      .map((entry) => path.join(iconDirectory, entry.name));

    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
  }

  const fallbackIconPath = resolveResourcePath('icon.png');
  return fs.existsSync(fallbackIconPath) ? fallbackIconPath : undefined;
}

export class NotificationManager {
  show(event: PraiseEvent, onClickCallback: () => void): void {
    // ── Windows ネイティブ通知 ──────────────────────────────
    // Notification.isSupported() が false の環境（WSL 等）では
    // トースト通知は使えないため、フォールバック処理のみ行う
    if (!Notification.isSupported()) {
      console.info(
        '[Notification] Notification.isSupported() = false。' +
        'WSL / 仮想環境では Windows トースト通知は届きません。' +
        'Windows ネイティブ環境で実行してください。'
      );
      // フォールバック: タスクバーをフラッシュしてユーザーに気づかせる
      this._flashTaskbar();
      return;
    }

    const notification = new Notification({
      title: event.title,
      body: event.message,
      ...(event.iconPath ? { icon: event.iconPath } : {}),
    });

    notification.on('click', () => {
      onClickCallback();
    });

    notification.on('failed', (_event, error) => {
      console.error('[Notification] 通知の表示に失敗しました:', error);
    });

    notification.show();
  }

  /** タスクバーボタンを点滅させる (WSL や通知が使えない環境のフォールバック) */
  private _flashTaskbar(): void {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      win.flashFrame(true);
      // 5 秒後にフラッシュを止める
      setTimeout(() => win.flashFrame(false), 5000);
    }
  }
}

export const notificationManager = new NotificationManager();
