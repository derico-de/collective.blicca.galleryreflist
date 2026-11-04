/** The block styles a site registers, read once while the bundle installs. */
export type BlockStyle = [id: string, name: string];

const VOCABULARY = 'collective.blicca.galleryreflist.BlockStyles';

let definitions: BlockStyle[] = [];

export function setBlockStyles(next: BlockStyle[]) {
  definitions = next;
}

export const blockStyles = () => definitions;

export const blockStyleIds = () => definitions.map(([id]) => id);

/** The site's styles; none when they can't be read, which hides the field. */
export async function loadBlockStyles(
  apiPath = '',
  fetchImpl: typeof fetch = fetch,
): Promise<BlockStyle[]> {
  const base = apiPath.replace(/\/+$/, '');
  try {
    const response = await fetchImpl(`${base}/@vocabularies/${VOCABULARY}?b_size=-1`, {
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    });
    if (!response.ok) return [];
    const { items } = await response.json();
    return items.map(({ token, title }: { token: string; title: string }) => [token, title]);
  } catch {
    return [];
  }
}
