/* Every icon in the design is a <use> into the sprite rendered by the layout.
   Returns null for an empty name so an unset field just omits the icon. */
export default function Icon({
  name,
  className = "icon",
}: {
  name: string;
  className?: string;
}) {
  if (!name) return null;
  return (
    <svg className={className}>
      <use href={`#${name}`} />
    </svg>
  );
}
