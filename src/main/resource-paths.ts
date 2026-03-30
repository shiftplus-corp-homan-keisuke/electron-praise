import { app } from 'electron';
import path from 'path';

export function getResourcesBasePath(): string {
  return app.isPackaged
    ? process.resourcesPath
    : path.join(__dirname, '../../resources');
}

export function resolveResourcePath(...segments: string[]): string {
  return path.join(getResourcesBasePath(), ...segments);
}
