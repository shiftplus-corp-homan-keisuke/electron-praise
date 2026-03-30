import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import path from 'path';
import { updateElectronApp } from 'update-electron-app';
import { IPC_CHANNELS } from '../shared/constants';
import type { PraiseEvent, PraisePreferences, PraiseSource } from '../shared/praise';
import { DEFAULT_PRAISE_SETTINGS } from '../shared/constants';
import { autoLaunch } from './auto-launch';
import { TrayManager } from './tray';
import { Scheduler } from './scheduler';
import { NotificationManager, getRandomNotificationIconPath } from './notification';
import { createPraiseEvent } from './praise-factory';
import { WebhookManager } from './webhook';
import { resolveResourcePath } from './resource-paths';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

// ─────────────────────────────────────────────────────────
// WSL / 仮想環境の互換性設定
// GPU アクセラレーションが動作しない環境（WSL2 など）では
// ハードウェアアクセラレーションを無効にしてソフトウェアレンダリングにフォールバック
// この呼び出しは app.whenReady() より前に行う必要がある
// ─────────────────────────────────────────────────────────
if (process.platform === 'linux') {
  app.disableHardwareAcceleration();
}

// ─────────────────────────────────────────────────────────
// Windows 通知を動作させるために必要な設定
// setAppUserModelId を設定しないと Windows の通知センターに通知が届かない
// ─────────────────────────────────────────────────────────
if (process.platform === 'win32') {
  app.setAppUserModelId('com.hachiware-praise.app');
}

updateElectronApp();

let mainWindow: BrowserWindow | null = null;
let trayManager: TrayManager | null = null;
const scheduler = new Scheduler();
const notificationManager = new NotificationManager();
const webhookManager = new WebhookManager();
let currentSettings: PraisePreferences = DEFAULT_PRAISE_SETTINGS;

function showWindow(): void {
  mainWindow?.show();
  mainWindow?.focus();
}

function toggleWindow(): void {
  if (!mainWindow) return;

  if (mainWindow.isVisible()) {
    mainWindow.hide();
    return;
  }

  showWindow();
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 560,
    height: 760,
    minWidth: 480,
    minHeight: 620,
    icon: resolveResourcePath('icon.png'),
    autoHideMenuBar: true,
    backgroundColor: '#fffaf0',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hidden',
    title: 'はちわれぷらいず',
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (typeof MAIN_WINDOW_VITE_DEV_SERVER_URL !== 'undefined') {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    // 開発環境では DevTools を自動で開く（エラー確認用）
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // ウィンドウの閉じるボタンはアプリ終了ではなく非表示にする
  mainWindow.on('close', (e) => {
    e.preventDefault();
    mainWindow?.hide();
  });
}

function initTray(): void {
  trayManager = new TrayManager(
    showWindow,
    toggleWindow,
    quit,
    () => {
      const current = autoLaunch.isEnabled();
      autoLaunch.set(!current);
      trayManager?.updateAutoLaunchMenuItem(!current);
    },
    () => {
      void dispatchPraise('manual');
    },
  );

  trayManager.init();
  trayManager.buildContextMenu(autoLaunch.isEnabled());
}

function quit(): void {
  // close イベントを外してから閉じることで確実に終了
  mainWindow?.removeAllListeners('close');
  mainWindow?.close();
  trayManager?.destroy();
  scheduler.stop();
  app.quit();
}

function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SYNC_PRAISE_SETTINGS, (_event, settings: PraisePreferences) => {
    currentSettings = settings;
    scheduler.updateSettings(settings);
  });

  ipcMain.handle(IPC_CHANNELS.TRIGGER_PRAISE_NOW, () => dispatchPraise('manual'));

  ipcMain.handle(IPC_CHANNELS.GET_AUTO_LAUNCH, () => autoLaunch.isEnabled());

  ipcMain.handle(
    IPC_CHANNELS.SET_AUTO_LAUNCH,
    (_event, enabled: boolean) => {
      autoLaunch.set(enabled);
      trayManager?.updateAutoLaunchMenuItem(enabled);
    }
  );

  ipcMain.handle(IPC_CHANNELS.GET_NATIVE_THEME, () =>
    nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
  );

  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    mainWindow?.minimize();
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      return;
    }
    mainWindow.maximize();
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, () => {
    mainWindow?.close();
  });

  nativeTheme.on('updated', () => {
    const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
    mainWindow?.webContents.send(IPC_CHANNELS.THEME_CHANGED, theme);
  });
}

function startScheduler(): void {
  scheduler.start((source) => {
    void dispatchPraise(source);
  });
}

async function dispatchPraise(source: PraiseSource): Promise<PraiseEvent> {
  const event = createPraiseEvent(source, getRandomNotificationIconPath());
  const skipNativeNotification =
    currentSettings.disableNativeNotificationOnWebhook &&
    currentSettings.webhook.url.trim().length > 0;

  mainWindow?.webContents.send(IPC_CHANNELS.PRAISE_FIRED, event);

  if (!skipNativeNotification) {
    notificationManager.show(event, () => {
      showWindow();
    });
  }

  void webhookManager.send(event, currentSettings);

  return event;
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
  initTray();
  startScheduler();
});

// ウィンドウが全て閉じてもアプリを終了しない (トレイ常駐)
app.on('window-all-closed', () => {
  // 何もしない: トレイの「終了」からのみ終了できる
});

// macOS: Dockアイコンクリック時にウィンドウがなければ再作成
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
