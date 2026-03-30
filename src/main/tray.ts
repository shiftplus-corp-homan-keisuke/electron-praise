import { Tray, Menu, nativeImage } from 'electron';
import fs from 'fs';
import { resolveResourcePath } from './resource-paths';

export class TrayManager {
  private tray: Tray | null = null;

  constructor(
    private readonly showWindowFn: () => void,
    private readonly toggleWindowFn: () => void,
    private readonly quitFn: () => void,
    private readonly toggleAutoLaunchFn: () => void,
    private readonly triggerPraiseFn: () => void,
  ) {}

  init(): boolean {
    const iconPath = resolveResourcePath('tray-icon.png');

    const icon = fs.existsSync(iconPath)
      ? iconPath
      : nativeImage.createEmpty();

    try {
      this.tray = new Tray(icon);
    } catch {
      // システムトレイが使えない環境 (GNOME デフォルト等)
      this.tray = null;
      return false;
    }

    this.tray.setToolTip('はちわれぷらいず');

    this.tray.on('click', () => {
      this.toggleWindowFn();
    });

    return true;
  }

  buildContextMenu(launchAtStartup: boolean): void {
    if (!this.tray) return;

    const menu = Menu.buildFromTemplate([
      {
        label: '開く',
        click: () => this.showWindowFn(),
      },
      {
        label: '今すぐ褒めてもらう',
        click: () => this.triggerPraiseFn(),
      },
      { type: 'separator' },
      {
        label: 'スタートアップに登録',
        type: 'checkbox',
        checked: launchAtStartup,
        click: () => this.toggleAutoLaunchFn(),
      },
      { type: 'separator' },
      {
        label: '終了',
        click: () => this.quitFn(),
      },
    ]);

    this.tray.setContextMenu(menu);
  }

  updateAutoLaunchMenuItem(enabled: boolean): void {
    this.buildContextMenu(enabled);
  }

  destroy(): void {
    this.tray?.destroy();
    this.tray = null;
  }
}
