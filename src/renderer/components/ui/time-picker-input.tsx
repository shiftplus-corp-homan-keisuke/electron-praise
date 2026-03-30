import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const DIGIT_BUFFER_DELAY = 1500;

type TimeSegment = 'hour' | 'minute';

interface SegmentProps {
  value: string;
  suffix: string;
  onKeyDown: (e: React.KeyboardEvent<HTMLSpanElement>) => void;
  onBlur?: () => void;
}

const Segment = forwardRef<HTMLSpanElement, SegmentProps>(
  ({ value, suffix, onKeyDown, onBlur }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <span className="inline-flex items-center gap-0.5">
        <span
          ref={ref}
          tabIndex={0}
          role="spinbutton"
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          onKeyDown={onKeyDown}
          className={cn(
            'inline-flex items-center justify-center rounded px-1 tabular-nums',
            'cursor-default select-none outline-none transition-colors',
            focused ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground',
          )}
        >
          {value}
        </span>
        <span className="text-muted-foreground select-none">{suffix}</span>
      </span>
    );
  },
);
Segment.displayName = 'Segment';

export interface TimePickerInputRef {
  focusHour(): void;
}

interface TimePickerInputProps {
  value: string;
  onChange: (value: string) => void;
  onExitLeft?: () => void;
  className?: string;
}

export const TimePickerInput = forwardRef<TimePickerInputRef, TimePickerInputProps>(
  ({ value, onChange, onExitLeft, className }, ref) => {
    const [drafts, setDrafts] = useState<Partial<Record<TimeSegment, string>>>({});
    const hourRef = useRef<HTMLSpanElement>(null);
    const minuteRef = useRef<HTMLSpanElement>(null);
    const digitTimersRef = useRef<Partial<Record<TimeSegment, ReturnType<typeof setTimeout>>>>({});

    useEffect(() => {
      return () => {
        Object.values(digitTimersRef.current).forEach((timer) => {
          if (timer) {
            clearTimeout(timer);
          }
        });
      };
    }, []);

    useImperativeHandle(ref, () => ({
      focusHour() {
        hourRef.current?.focus();
      },
    }));

    const parts = value ? value.split(':').map(Number) : [];
    const hour = !Number.isNaN(parts[0]) ? parts[0] : 9;
    const minute = !Number.isNaN(parts[1]) ? parts[1] : 0;

    const commit = (h: number, m: number) => {
      const nextHour = ((h % 24) + 24) % 24;
      const nextMinute = ((m % 60) + 60) % 60;
      onChange(`${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`);
    };

    const clearDraft = (segment: TimeSegment) => {
      const timer = digitTimersRef.current[segment];
      if (timer) {
        clearTimeout(timer);
        delete digitTimersRef.current[segment];
      }

      setDrafts((current) => {
        if (!(segment in current)) {
          return current;
        }

        const next = { ...current };
        delete next[segment];
        return next;
      });
    };

    const setDraft = (segment: TimeSegment, nextDigits: string) => {
      const currentTimer = digitTimersRef.current[segment];
      if (currentTimer) {
        clearTimeout(currentTimer);
      }

      setDrafts((current) => ({ ...current, [segment]: nextDigits }));
      digitTimersRef.current[segment] = setTimeout(() => {
        clearDraft(segment);
      }, DIGIT_BUFFER_DELAY);
    };

    const clearAllDrafts = () => {
      clearDraft('hour');
      clearDraft('minute');
    };

    const handleDigitInput = (segment: TimeSegment, digit: string) => {
      const currentDraft = drafts[segment] ?? '';
      const nextDigits = currentDraft.length > 0 && currentDraft.length < 2 ? `${currentDraft}${digit}` : digit;
      const nextValue = Number(nextDigits);

      if (Number.isNaN(nextValue)) {
        return;
      }

      setDraft(segment, nextDigits);

      if (nextDigits.length === 1) {
        if (digit === '0') {
          return;
        }

        if (segment === 'hour') {
          commit(nextValue, minute);
        } else {
          commit(hour, nextValue);
        }

        return;
      }

      clearDraft(segment);

      const maxValue = segment === 'hour' ? 23 : 59;
      if (nextValue < 0 || nextValue > maxValue) {
        return;
      }

      if (segment === 'hour') {
        commit(nextValue, minute);
      } else {
        commit(hour, nextValue);
      }
    };

    const displayValue = (segment: TimeSegment) => {
      const draft = drafts[segment];
      if (draft !== undefined) {
        return draft;
      }

      return segment === 'hour' ? String(hour).padStart(2, '0') : String(minute).padStart(2, '0');
    };

    const makeKeyDown = (segment: TimeSegment) => (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (/^\d$/.test(e.key)) {
        e.preventDefault();
        handleDigitInput(segment, e.key);
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          clearAllDrafts();
          segment === 'hour' ? commit(hour + 1, minute) : commit(hour, minute + 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          clearAllDrafts();
          segment === 'hour' ? commit(hour - 1, minute) : commit(hour, minute - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          clearAllDrafts();
          if (segment === 'hour') minuteRef.current?.focus();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          clearAllDrafts();
          if (segment === 'minute') {
            hourRef.current?.focus();
          } else {
            onExitLeft?.();
          }
          break;
      }
    };

    return (
      <div
        className={cn(
          'flex h-9 items-center rounded-md border border-input bg-transparent px-3 text-sm shadow-xs',
          'focus-within:ring-1 focus-within:ring-ring transition-colors',
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <Segment
            ref={hourRef}
            value={displayValue('hour')}
            suffix="時"
            onKeyDown={makeKeyDown('hour')}
            onBlur={() => clearDraft('hour')}
          />
          <Segment
            ref={minuteRef}
            value={displayValue('minute')}
            suffix="分"
            onKeyDown={makeKeyDown('minute')}
            onBlur={() => clearDraft('minute')}
          />
        </div>
      </div>
    );
  },
);
TimePickerInput.displayName = 'TimePickerInput';
