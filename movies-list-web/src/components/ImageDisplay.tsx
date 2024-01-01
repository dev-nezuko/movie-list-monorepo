import { ReactComponent as DeleteIcon } from 'assets/delete-icon.svg';
import { Image } from 'types/Image';

interface ImageProps {
  removeFile: () => void;
  image?: Image;
}

export const ImageDisplay = ({ removeFile, image }: ImageProps): JSX.Element | null => {
  if (!image || !image.file) {
    return null;
  }

  const imageUrl = URL.createObjectURL(image.file);

  return (
    <div className="relative mt-6">
      <img
        src={imageUrl}
        alt="Uploaded file"
        aria-hidden="true"
        className="self-center object-cover object-center rounded-lg h-60 w-60"
        loading="lazy"
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          removeFile();
        }}
        className="absolute text-xs text-gray-600 bg-white rounded-full -right-4 hover:text-gray-500 -top-4"
      >
        <DeleteIcon className="w-4 my-1 mx-1.5" />
      </button>
    </div>
  );
};
