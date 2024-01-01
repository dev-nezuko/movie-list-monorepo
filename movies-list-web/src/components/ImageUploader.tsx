import Dropzone from "react-dropzone";
import { ReactComponent as DropIcon } from "assets/drop-icon.svg";
import { useCallback, useState } from "react";
import { Image } from "types/Image";
import { ImageDisplay } from "./ImageDisplay";

interface Props {
  image?: Image;
  onFileUpload: (image: Image) => void;
  onImageRemove: () => void;
}

export const ImageUploader = ({ image, onFileUpload, onImageRemove }: Props) => {
  const [uploadError, setUploadError] = useState("");
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length) {
        setUploadError("");
        const file = acceptedFiles[0];
        onFileUpload({
          name: file.name,
          type: file.type,
          file,
        });
      }
    },
    [onFileUpload]
  );

  return (
    <Dropzone accept={{ "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] }} maxSize={5 * 1024 * 1024} maxFiles={1} onDropRejected={() => setUploadError("Choose one PNG/JPEG image up to 5 MiB.")} onDrop={onDrop}>
      {({ getRootProps, getInputProps }) => (
        <section className="h-[504px] bg-inputColor w-full max-w-[473px] border border-white border-dashed rounded-xl flex flex-col items-center justify-center text-white">
          {image?.file ? (
            <ImageDisplay image={image} removeFile={onImageRemove} />
          ) : (
            <div
              {...getRootProps()}
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              <input {...getInputProps()} />
              <DropIcon />
              <p>Drop a PNG or JPEG poster here</p><p className="text-sm opacity-75">One image, up to 5 MiB</p>
            </div>
          )}
          {uploadError && <p role="alert" className="px-4 text-center text-red-300">{uploadError}</p>}
        </section>
      )}
    </Dropzone>
  );
};
