import Dropzone from "react-dropzone";
import { ReactComponent as DropIcon } from "assets/drop-icon.svg";
import { useCallback } from "react";
import { Image } from "types/Image";
import { ImageDisplay } from "./ImageDisplay";

interface Props {
  image?: Image;
  onFileUpload: (image: Image) => void;
  onImageRemove: () => void;
}

export const ImageUploader = ({ image, onFileUpload, onImageRemove }: Props) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length) {
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
    <Dropzone accept={{ "image/*": [] }} maxFiles={1} onDrop={onDrop}>
      {({ getRootProps, getInputProps }) => (
        <section className="h-[504px] bg-inputColor w-[473px] border border-white border-dashed rounded-xl flex flex-col items-center justify-center text-white">
          {image?.file ? (
            <ImageDisplay image={image} removeFile={onImageRemove} />
          ) : (
            <div
              {...getRootProps()}
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              <input {...getInputProps()} />
              <DropIcon />
              <p>Drop an image here</p>
            </div>
          )}
        </section>
      )}
    </Dropzone>
  );
};
