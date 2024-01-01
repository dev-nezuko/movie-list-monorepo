import Dropzone from "react-dropzone";
import { UploadIcon } from "components/icons";
import { useCallback, useState } from "react";
import { Image } from "types/Image";
import { ImageDisplay } from "./ImageDisplay";

interface Props {
  image?: Image;
  currentPosterUrl?: string;
  onFileUpload: (image: Image) => void;
  onImageRemove: () => void;
}

export const ImageUploader = ({ image, currentPosterUrl, onFileUpload, onImageRemove }: Props) => {
  const [uploadError, setUploadError] = useState("");
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length) {
        setUploadError("");
        const file = acceptedFiles[0];
        onFileUpload({ name: file.name, type: file.type, file });
      }
    },
    [onFileUpload]
  );

  return (
    <Dropzone accept={{ "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] }} maxSize={5 * 1024 * 1024} maxFiles={1} onDropRejected={() => setUploadError("Choose one PNG/JPEG image up to 5 MiB.")} onDrop={onDrop}>
      {({ getRootProps, getInputProps }) => (
        <section className="min-h-[320px] md:h-[504px] bg-inputColor w-full max-w-[473px] border-2 border-line border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-ink">
          {image?.file ? (
            <ImageDisplay image={image} removeFile={onImageRemove} />
          ) : (
            <div
              {...getRootProps()}
              className="flex flex-col items-center gap-2 p-4 rounded-lg cursor-pointer text-center"
            >
              <input {...getInputProps()} aria-label="Poster image" />
              {currentPosterUrl && (
                <img src={currentPosterUrl} alt="Current poster" className="object-cover mb-4 rounded-lg h-60 w-40" />
              )}
              <UploadIcon />
              <p>{currentPosterUrl ? "Drop a PNG or JPEG to replace the poster" : "Drop a PNG or JPEG poster here"}</p>
              <p className="text-sm text-muted">One image, up to 5 MiB</p>
            </div>
          )}
          {uploadError && <p role="alert" className="px-4 text-center text-error">{uploadError}</p>}
        </section>
      )}
    </Dropzone>
  );
};
