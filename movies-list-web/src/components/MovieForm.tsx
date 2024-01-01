import { Input } from "components/Input";
import { Form, Formik } from "formik";
import { Button } from "components/Button";
import { ImageUploader } from "components/ImageUploader";
import { useState, useEffect } from "react";
import { Image } from "types/Image";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "constants/routes";
import { movieSchema } from "schemas/movieSchema";
import { createMovie, updateMovie } from "../services/api";

interface Props {
  isEditState?: boolean;
  initialData?: any;
}

export const MovieForm = ({ isEditState, initialData }: Props): JSX.Element => {
  const navigate = useNavigate();
  const [droppedImage, setDroppedImage] = useState<Image | undefined>();

  useEffect(() => {
    if (initialData) {
      setDroppedImage({
        name: initialData.title || "",
        type: initialData.imageType || "",
        file: null,
      });
    }
  }, [initialData]);

  const onDrop = (image: Image) => setDroppedImage(image);
  const onImageRemove = () => setDroppedImage(undefined);

  const submitForm = async (values: { title: string; year: string }) => {
    try {
      const userToken = localStorage.getItem('userToken');
      if (!userToken) {
        navigate(ROUTES.signin);
        return;
      }

      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('publicationYear', values.year);

      if (droppedImage?.file instanceof File) {
        formData.append('image', droppedImage.file);
      }

      const apiFunction = isEditState ? updateMovie : createMovie;
      const response = await apiFunction(formData, userToken);

      if (!response.ok) {
        throw new Error(isEditState ? 'Failed to update the movie' : 'Failed to create a new movie');
      }

      navigate(ROUTES.movies);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Formik
      initialValues={{ title: initialData?.title || "", year: initialData?.publishYear || "" }}
      onSubmit={submitForm}
      validationSchema={movieSchema}
    >
      {() => (
        <Form className="grid grid-cols-2">
          <ImageUploader image={droppedImage} onFileUpload={onDrop} onImageRemove={onImageRemove} />
          <div className="flex flex-col w-1/2 gap-3">
            <Input name="title" placeholder="Title" />
            <Input name="year" placeholder="Publishing year" />
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => navigate(ROUTES.movies)}>Cancel</Button>
              <Button type="submit">{isEditState ? "Update" : "Submit"}</Button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
