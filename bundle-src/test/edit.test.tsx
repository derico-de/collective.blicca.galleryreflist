import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import config from '@plone/registry';

import referenceListInstall from '../../../collective.blicca.referencelist/bundle-src/src/index';
import { seededData } from '../src/galleryreflist/data';
import GalleryReflistEdit from '../src/galleryreflist/GalleryReflistEdit';
import GalleryReflistView from '../src/galleryreflist/GalleryReflistView';
import { installUpstreamRegistry } from './upstream-registry';

beforeAll(() => {
  referenceListInstall(installUpstreamRegistry(config as any));
});
afterEach(cleanup);

const CATS = [480, 640, 800].map((width) => `https://cataas.com/cat?filter=mono&width=${width}`);
const picked = { '@id': 'http://site/Plone/a', UID: 'ua', title: 'Picked item' };

function withReferences() {
  const data = seededData();
  return { ...data, blocks: { ...data.blocks, gallery: { ...data.blocks.gallery, references: [picked] } } };
}

describe('the seed', () => {
  it('writes once on a fresh block and keeps what the block carries', () => {
    const onChangeBlock = vi.fn();
    const { rerender } = render(
      <GalleryReflistEdit block="b1" data={{ blockWidth: 'layout' }} onChangeBlock={onChangeBlock} />,
    );
    rerender(<GalleryReflistEdit block="b1" data={{ blockWidth: 'layout' }} onChangeBlock={onChangeBlock} />);
    expect(onChangeBlock).toHaveBeenCalledTimes(1);
    const [id, next] = onChangeBlock.mock.calls[0];
    expect(id).toBe('b1');
    expect(next.blockWidth).toBe('layout');
    expect(next.blocks.gallery.references).toEqual([]);
  });

  it('leaves a seeded block alone, also when a field was cleared', () => {
    const onChangeBlock = vi.fn();
    const data = seededData();
    data.blocks.heading.children = [{ text: '' }];
    render(<GalleryReflistEdit block="b1" data={data} onChangeBlock={onChangeBlock} />);
    expect(onChangeBlock).not.toHaveBeenCalled();
  });
});

describe('the inline fields', () => {
  it('stand inside the elements the page renders', () => {
    const { container } = render(<GalleryReflistEdit block="b1" data={seededData()} />);
    expect(container.querySelector('.galleryreflist > .block-h3 > h3 > textarea')).toBeTruthy();
    expect(container.querySelector('.galleryreflist > .block-p > p > textarea')).toBeTruthy();
  });

  it('write the typed text into the nested child', () => {
    const onChangeBlock = vi.fn();
    const data = seededData();
    const { getByLabelText } = render(
      <GalleryReflistEdit block="b1" data={data} onChangeBlock={onChangeBlock} />,
    );
    fireEvent.change(getByLabelText('Heading'), { target: { value: 'Typed' } });
    const next = onChangeBlock.mock.calls[0][1];
    expect(next.blocks.heading).toEqual({ type: 'h3', children: [{ text: 'Typed' }] });
    expect(next.blocks.gallery).toBe(data.blocks.gallery);
  });

  it('keep the keyboard from the editor', () => {
    const onKeyDown = vi.fn();
    const { getByLabelText } = render(
      <div onKeyDown={onKeyDown}>
        <GalleryReflistEdit block="b1" data={seededData()} />
      </div>,
    );
    fireEvent.keyDown(getByLabelText('Text'), { key: 'Backspace' });
    expect(onKeyDown).not.toHaveBeenCalled();
  });

  // The host writes the block back after the keystroke, in a later render.
  const typeAt = (field: HTMLTextAreaElement, caret: number, key: string) => {
    const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!;
    setValue.call(field, field.value.slice(0, caret) + key + field.value.slice(caret));
    field.setSelectionRange(caret + key.length, caret + key.length);
    fireEvent.input(field);
  };

  it('keep the caret where the words go in', () => {
    const onChangeBlock = vi.fn();
    const { getByLabelText, rerender } = render(
      <GalleryReflistEdit block="b1" data={seededData()} onChangeBlock={onChangeBlock} />,
    );
    const heading = getByLabelText('Heading') as HTMLTextAreaElement;
    heading.focus();
    typeAt(heading, 3, 'X');
    rerender(<GalleryReflistEdit block="b1" data={onChangeBlock.mock.calls[0][1]} onChangeBlock={onChangeBlock} />);
    expect(heading.value).toBe('A hXeading for this gallery');
    expect(heading.selectionStart).toBe(4);
  });

  it('show the block again once left', () => {
    const data = seededData();
    const { getByLabelText, rerender } = render(
      <GalleryReflistEdit block="b1" data={data} onChangeBlock={vi.fn()} />,
    );
    const heading = getByLabelText('Heading') as HTMLTextAreaElement;
    heading.focus();
    typeAt(heading, 0, 'X');
    fireEvent.blur(heading);
    const undone = { ...data, blocks: { ...data.blocks, heading: { type: 'h3', children: [{ text: 'Undone' }] } } };
    rerender(<GalleryReflistEdit block="b1" data={undone} onChangeBlock={vi.fn()} />);
    expect(heading.value).toBe('Undone');
  });

  it('stay on one line', () => {
    const onChangeBlock = vi.fn();
    const { getByLabelText } = render(
      <GalleryReflistEdit block="b1" data={seededData()} onChangeBlock={onChangeBlock} />,
    );
    fireEvent.change(getByLabelText('Text'), { target: { value: 'a\nb' } });
    expect(onChangeBlock.mock.calls[0][1].blocks.text.children[0].text).toBe('a b');
  });
});

describe('the gallery on the canvas', () => {
  it('shows the example images until references are picked', () => {
    const { container } = render(<GalleryReflistEdit block="b1" data={seededData()} />);
    const images = [...container.querySelectorAll('.referencelist img')];
    expect(images.map((image) => image.getAttribute('src'))).toEqual(CATS);
    expect(container.querySelector('.referencelist.variation-grid')).toBeTruthy();
    expect(container.querySelector('.referencelist-notice')?.textContent).toContain('Example images');
  });

  it('shows the real items as soon as references are set', () => {
    const { container } = render(<GalleryReflistEdit block="b1" data={withReferences()} />);
    expect(container.innerHTML).not.toContain('cataas');
    expect(container.querySelector('.referencelist')?.textContent).toContain('Picked item');
    expect(container.querySelector('.referencelist-notice')).toBeNull();
  });

  it('leaves the style class to the editor’s block wrapper', () => {
    const { container } = render(
      <GalleryReflistEdit block="b1" data={{ ...seededData(), blockStyle: 'feature' }} />,
    );
    expect(container.querySelector('section')?.className).toBe('galleryreflist');
  });
});

describe('the view', () => {
  it('renders the same anatomy with the real items', () => {
    const { container } = render(<GalleryReflistView data={withReferences()} />);
    expect(container.querySelector('.galleryreflist > .block-h3 > h3')?.textContent).toBeTruthy();
    expect(container.querySelector('.galleryreflist > .block-p > p')?.textContent).toBeTruthy();
    expect(container.querySelector('.referencelist')?.textContent).toContain('Picked item');
  });

  it('never shows placeholders or an empty gallery', () => {
    const { container } = render(<GalleryReflistView data={seededData()} />);
    expect(container.innerHTML).not.toContain('cataas');
    expect(container.querySelector('.referencelist')).toBeNull();
  });

  it('renders nothing for a block with nothing to show', () => {
    expect(render(<GalleryReflistView data={{}} />).container.innerHTML).toBe('');
  });
});
