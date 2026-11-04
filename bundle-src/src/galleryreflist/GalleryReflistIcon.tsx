/** The slash-menu icon: a heading and a text over a row of images. */
export function GalleryReflistIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M4 5h9M4 9h16" />
      <rect x="3.5" y="13" width="5" height="6.5" rx="1" />
      <rect x="9.5" y="13" width="5" height="6.5" rx="1" />
      <rect x="15.5" y="13" width="5" height="6.5" rx="1" />
    </svg>
  );
}

export default GalleryReflistIcon;
