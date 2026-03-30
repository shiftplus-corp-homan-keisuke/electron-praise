import { randomUUID } from 'crypto';
import type { PraiseEvent, PraiseSource } from '../shared/praise';
import { HACHIWARE_PRAISE_MESSAGES } from '../shared/praise-messages';

const PRAISE_TITLES = [
  'はちわれからの褒めことば',
  'はちわれが見てるよ',
  'ちいさな花まるをどうぞ',
  '今日のえらいをお届け',
  'はちわれの応援タイム',
  'きみ、かなりいい感じだよ',
];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function createPraiseEvent(
  source: PraiseSource,
  iconPath?: string,
): PraiseEvent {
  return {
    id: randomUUID(),
    title: pickRandom(PRAISE_TITLES),
    message: pickRandom(HACHIWARE_PRAISE_MESSAGES),
    firedAt: new Date().toISOString(),
    source,
    ...(iconPath ? { iconPath } : {}),
  };
}
