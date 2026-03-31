import { randomUUID } from 'crypto';
import type { PraiseEvent, PraiseSource } from '../shared/praise';
import {
  HACHIWARE_PRAISE_MESSAGES,
  CHIIKAWA_MESSAGES,
  CHIIKAWA_TITLE,
} from '../shared/praise-messages';
import { resolveResourcePath } from './resource-paths';

const PRAISE_TITLES = [
  'はちわれからの褒めことば',
  'はちわれが見てるよ',
  'ちいさな花まるをどうぞ',
  '今日のえらいをお届け',
  'はちわれの応援タイム',
  'かなりいい感じだよッ',
];

/** ちいかわメッセージが出現する確率（約3%） */
const CHIIKAWA_PROBABILITY = 0.03;

function pickRandom<T>(items: readonly T[] | T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function createPraiseEvent(
  source: PraiseSource,
  iconPath?: string,
): PraiseEvent {
  const isChiikawa = Math.random() < CHIIKAWA_PROBABILITY;

  if (isChiikawa) {
    return {
      id: randomUUID(),
      title: CHIIKAWA_TITLE,
      message: pickRandom(CHIIKAWA_MESSAGES),
      firedAt: new Date().toISOString(),
      source,
      iconPath: resolveResourcePath('chiikawa.png'),
    };
  }

  return {
    id: randomUUID(),
    title: pickRandom(PRAISE_TITLES),
    message: pickRandom(HACHIWARE_PRAISE_MESSAGES),
    firedAt: new Date().toISOString(),
    source,
    ...(iconPath ? { iconPath } : {}),
  };
}
