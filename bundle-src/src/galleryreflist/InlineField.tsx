/**
 * A bare textarea standing where the published page puts the words, dressed by
 * the sheet to inherit the element it stands in. A void's native control stops
 * its keyboard and clipboard events at itself (block add-on contract §1.7);
 * mouse events stay, so a click still selects the block.
 */
import { useLayoutEffect, useRef, useState, type SyntheticEvent } from 'react';

export type InlineFieldProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
};

const stop = (event: SyntheticEvent) => event.stopPropagation();

export function InlineField({ value, onChange, label }: InlineFieldProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  // The host writes a keystroke into the block a render later. Showing the
  // block's words until then would reset the field, and the caret to its end.
  const [typed, setTyped] = useState<string | null>(null);
  const shown = typed ?? value;

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, [shown]);

  return (
    <textarea
      ref={ref}
      className="galleryreflist-input"
      rows={1}
      value={shown}
      placeholder={label}
      aria-label={label}
      onChange={(event) => {
        const text = event.target.value.replace(/[\r\n]+/g, ' ');
        setTyped(text);
        onChange(text);
      }}
      onBlur={() => setTyped(null)}
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
