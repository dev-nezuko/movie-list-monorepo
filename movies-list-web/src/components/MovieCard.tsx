interface Props {
  title: string;
  year: string;
  image: string;
  onEditClick: () => void;
}

export const MovieCard = ({ title, year, image, onEditClick }: Props) => (
  <button
    type="button"
    aria-label={`Edit ${title} (${year})`}
    className="group flex flex-col w-full p-2 text-left rounded-xl bg-cardColor transition-colors hover:bg-inputColor"
    onClick={onEditClick}
  >
    <img
      src={image}
      alt=""
      width="266"
      height="400"
      className="w-full aspect-[2/3] object-cover rounded-lg bg-inputColor"
    />
    <div className="px-2 pt-3 pb-2">
      <h2 className="text-lg leading-snug text-ink line-clamp-2 group-hover:text-primary">{title}</h2>
      <p className="mt-1 text-sm tabular-nums text-muted">{year}</p>
    </div>
  </button>
);
