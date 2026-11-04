/**
 * A bare textarea standing where the published page puts the words, dressed by
 * the sheet to inherit the element it stands in. A void's native control stops
 * its keyboard and clipboard events at itself (block add-on contract §1.7);
 * mouse events stay, so a click still selects the block.
 */
import { useLayoutEffect, useRef, type SyntheticEvent } from 'react';

export type InlineFieldProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
};

const stop = (event: SyntheticEvent) => event.stopPropagation();

export function InlineField({ value, onChange, label }: InlineFieldProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      className="galleryreflist-input"
      rows={1}
      value={value}
      placeholder={label}
      aria-label={label}
      onChange={(event) => onChange(event.target.value.replace(/[\r\n]+/g, ' '))}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === 'Enter') event.preventDefault();
      }}
      onKeyUp={stop}
      onBeforeInput={stop}
      onPaste={stop}
      onCopy={stop}
      onCut={stop}
      onDrop={stop}
    />
  );
}

export default InlineField;
