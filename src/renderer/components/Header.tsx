import type { CSSProperties } from 'react';
import appIcon from '@/assets/icon.png';
import { getElectronAPI } from '../lib/ipc';

export default function Header() {
  return (
    <div
      className="flex h-[36px] w-full shrink-0 items-center border-b border-border/30 bg-background/50 select-none backdrop-blur-sm"
      style={{ WebkitAppRegion: 'drag' } as CSSProperties}
    >
      <div className="flex items-center gap-2 px-3 text-[11.5px] font-medium tracking-wider text-muted-foreground/80">
        <img
          src={appIcon}
          alt="icon"
          className="h-4 w-4 object-contain opacity-90 drop-shadow-sm"
          draggable={false}
        />
        <span>はちわれぷらいず</span>
      </div>

      <div className="ml-auto flex h-full" style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}>
        <button
          onClick={() => getElectronAPI()?.minimizeWindow()}
          className="flex h-full items-center justify-center px-4 text-muted-foreground transition-colors hover:bg-black/10 hover:text-foreground dark:hover:bg-white/10"
          tabIndex={-1}
          aria-label="最小化"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 5H10" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
        <button
          onClick={() => getElectronAPI()?.maximizeWindow()}
          className="flex h-full items-center justify-center px-4 text-muted-foreground transition-colors hover:bg-black/10 hover:text-foreground dark:hover:bg-white/10"
          tabIndex={-1}
          aria-label="最大化"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
        <button
          onClick={() => getElectronAPI()?.closeWindow()}
          className="flex h-full items-center justify-center px-4 text-muted-foreground transition-colors hover:bg-[#e81123] hover:text-white"
          tabIndex={-1}
          aria-label="閉じる"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
