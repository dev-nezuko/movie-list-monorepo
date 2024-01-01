interface Props {
  title: string;
  year: string;
  image: string;
  onEditClick: () => void;
}

export const MovieCard = ({ title, year, image, onEditClick }: Props) => {

  return (
    <div
      className="rounded-xl bg-cardColor w-[282px] p-2 cursor-pointer"
      onClick={onEditClick}
    >
      <img
        src={image}
        alt="movie"
        width="266"
        height="400"
        className="rounded-xl"
      />
      <div className="p-2">
        <h3 className="text-lg text-white">{title}</h3>
        <p className="text-sm text-white">{year}</p>
      </div>
    </div>
  );
};
