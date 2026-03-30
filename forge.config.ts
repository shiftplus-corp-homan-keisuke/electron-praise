import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { PublisherGithub } from '@electron-forge/publisher-github';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: 'resources/icon',
    executableName: 'hachiware-praise',
    // 通知アイコン・トレイアイコンを process.resourcesPath 下に配置
    extraResource: [
      'resources/icon.png',
      'resources/tray-icon.png',
      'resources/tray-icon@2x.png',
      'resources/notification-icons',
    ],
    // Windows 向けメタデータ
    appCopyright: `Copyright © ${new Date().getFullYear()}`,
    win32metadata: {
      FileDescription: 'はちわれぷらいず',
      OriginalFilename: 'hachiware-praise.exe',
      ProductName: 'はちわれぷらいず',
    },
  },
  rebuildConfig: {},
  makers: [
    // Windows: Squirrel インストーラー (npm run make on Windows)
    new MakerSquirrel({
      name: 'hachiware_praise',
      setupIcon: 'resources/icon.ico',
      setupExe: 'HachiwarePraiseSetup.exe',
    }),
    // 全プラットフォーム: ZIP (CI / クロスビルド検証用)
    new MakerZIP({}),
  ],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: 'shiftplus-corp-homan-keisuke',
        name: 'electron-praise',
      },
      prerelease: false,
      draft: true,
    }),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      build: [
        {
          entry: 'src/main/index.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload/index.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
  ],
};

export default config;
