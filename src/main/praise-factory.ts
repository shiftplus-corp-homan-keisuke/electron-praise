import { randomUUID } from 'crypto';
import type { PraiseEvent, PraiseSource } from '../shared/praise';
import {
  HACHIWARE_PRAISE_MESSAGES,
  CHIIKAWA_MESSAGES,
  CHIIKAWA_TITLE,
  USAGI_MESSAGES,
  USAGI_TITLE,
} from '../shared/praise-messages';
import { resolveExistingResourcePath } from './resource-paths';

const PRAISE_TITLES = [
  'はちわれからの褒めことば',
  'はちわれが見てるよ',
  'ちいさな花まるをどうぞ',
  '今日のえらいをお届け',
  'はちわれの応援タイム',
  'かなりいい感じだよッ',
];

/** ちいかわ・うさぎメッセージ合わせた出現確率（約5%） */
const SPECIAL_PROBABILITY = 0.05;
/** 特殊メッセージ内でうさぎが選ばれる割合（約60%） */
const USAGI_RATIO = 0.6;
const DEFAULT_ICON_SEGMENTS = ['icon.png'];

function pickRandom<T>(items: readonly T[] | T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function createPraiseEvent(
  source: PraiseSource,
  iconPath?: string,
): PraiseEvent {
  if (Math.random() < SPECIAL_PROBABILITY) {
    const isUsagi = Math.random() < USAGI_RATIO;
    const specialIconSegments = [isUsagi ? 'usagi.png' : 'chiikawa.png'];

    return {
      id: randomUUID(),
      title: isUsagi ? USAGI_TITLE : CHIIKAWA_TITLE,
      message: pickRandom(isUsagi ? USAGI_MESSAGES : CHIIKAWA_MESSAGES),
      firedAt: new Date().toISOString(),
      source,
      iconPath: resolveExistingResourcePath(
        specialIconSegments,
        DEFAULT_ICON_SEGMENTS,
      ),
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
