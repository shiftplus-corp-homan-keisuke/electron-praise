# Hachiware Praise

はちわれをモチーフにした Windows 向けの褒め言葉アプリです。

指定した間隔で Windows 通知を送り、アプリ内蔵のランダムな褒めことばを届けます。ウィンドウを閉じても終了せず、タスクトレイに常駐し続けます。

## 主な機能

- 指定間隔でランダムな褒めことばを通知
- 通知ごとにアイコンをランダム切り替え
- Webhook への JSON POST
- タスクトレイ常駐
- Windows 起動時の自動起動
- ライト / ダーク / システムテーマ
- 設定画面のみのシンプルな UI

## 画面構成

- 設定画面のみ
- 褒めモードの ON / OFF
- 通知間隔の設定
- Webhook の有効 / 無効と URL 設定
- テーマ設定
- スタートアップ設定
- 最近の褒めことば表示

## 通知アイコン

通知用の画像は `resources/notification-icons/` に配置してください。

対応形式:

- `.png`
- `.jpg`
- `.jpeg`
- `.webp`
- `.ico`

通知時にはこのフォルダからランダムで 1 枚選ばれます。
画像が 1 枚もない場合は `resources/icon.png` を使います。

置き換える想定のアセット:

- `resources/icon.png`
- `resources/icon.ico`
- `resources/tray-icon.png`
- `resources/tray-icon@2x.png`
- `resources/notification-icons/*`

## Webhook

Webhook を有効にすると、通知発火時に指定 URL へ `POST` します。

主な送信フィールド:

```json
{
  "app": "hachiware-praise",
  "type": "praise",
  "sentAt": "2026-03-30T12:34:56.000Z",
  "source": "scheduled",
  "title": "はちわれからの褒めことば",
  "message": "今日もちゃんとここまで来て、えらいよ",
  "intervalMinutes": 60,
  "iconFileName": "icon-01.png"
}
```

## 開発

### セットアップ

```bash
npm install
npm start
```

### 型チェック

```bash
npm run lint
```

### パッケージング

```bash
npm run package
```

### Windows インストーラー

```bash
npm run make
```

Squirrel.Windows のセットアップファイル名は `HachiwarePraiseSetup.exe` です。

## 技術スタック

- Electron 35
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Zustand
- Dexie

## 補足

- 通知は Windows ネイティブ環境で確認してください
- WSL では Windows トースト通知の代わりにフォールバック動作になることがあります
- ウィンドウ右上の閉じる操作では終了せず、タスクトレイに格納されます

## License

MIT
