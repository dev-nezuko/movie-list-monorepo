import { useEffect, useRef } from 'react';
import { TrashIcon } from 'components/icons';
import { Image } from 'types/Image';

interface ImageProps {
  removeFile: () => void;
  image?: Image;
}

export const ImageDisplay = ({ removeFile, image }: ImageProps): JSX.Element | null => {
  const previewRef = useRef<HTMLImageElement>(null);
  const file = image?.file;

  // The object URL is created and revoked in one effect so StrictMode's re-run never shows a revoked URL.
  useEffect(() => {
    if (!file || !previewRef.current) return;
    const url = URL.createObjectURL(file);
    previewRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!file) return null;

  return (
    <div className="relative mt-6">
      <img
        ref={previewRef}
        alt="Selected poster preview"
        className="self-center object-cover object-center rounded-lg h-60 w-60"
      />
      <button
        type="button"
        aria-label="Remove poster"
        onClick={(e) => {
          e.stopPropagation();
          removeFile();
        }}
        className="absolute text-xs text-gray-600 bg-white rounded-full -right-4 hover:text-gray-500 -top-4"
      >
        <TrashIcon className="w-4 my-1 mx-1.5" />
      </button>
    </div>
  );
};
