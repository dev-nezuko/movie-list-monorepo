interface Props {
  title: string;
  year: string;
  image: string;
  onEditClick: () => void;
}

export const MovieCard = ({ title, year, image, onEditClick }: Props) => {

  return (
    <button type="button" aria-label={`Edit ${title}`}
      className="rounded-xl bg-cardColor w-full p-2 text-left cursor-pointer"
      onClick={onEditClick}
    >
      <img
        src={image}
        alt={`Poster for ${title}`}
        width="266"
        height="400"
        className="rounded-xl w-full aspect-[2/3] object-cover"
      />
      <div className="p-2">
        <h3 className="text-lg text-white">{title}</h3>
        <p className="text-sm text-white">{year}</p>
      </div>
    </button>
  );
};
