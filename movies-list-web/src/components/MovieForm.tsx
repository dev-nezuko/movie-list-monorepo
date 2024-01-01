import { useState } from "react";
import { Form, Formik } from "formik";
import { useNavigate } from "react-router-dom";
import { Button } from "components/Button";
import { ImageUploader } from "components/ImageUploader";
import { Input } from "components/Input";
import { ROUTES } from "constants/routes";
import { usePosterUrl } from "hooks/usePosterUrl";
import { useSignOutOn401 } from "hooks/useSignOutOn401";
import { movieSchema } from "schemas/movieSchema";
import { saveMovie } from "services/api";
import { getToken } from "services/session";
import { Image } from "types/Image";
import { Movie } from "types/Movie";

interface Props {
  isEditState?: boolean;
  initialData?: Movie;
}

export const MovieForm = ({ isEditState, initialData }: Props): JSX.Element => {
  const navigate = useNavigate();
  const signOutOn401 = useSignOutOn401();
  const [error, setError] = useState("");
  const [droppedImage, setDroppedImage] = useState<Image | undefined>();
  const currentPosterUrl = usePosterUrl(isEditState ? initialData?._id : undefined);

  const submitForm = async (values: { title: string; year: string }) => {
    setError("");
    if (!isEditState && !droppedImage?.file) {
      setError("Choose a poster before creating a movie.");
      return;
    }

    const formData = new FormData();
    formData.append("title", values.title.trim());
    formData.append("publicationYear", String(values.year));
    if (droppedImage?.file instanceof File) formData.append("image", droppedImage.file);

    try {
      await saveMovie(formData, getToken(), isEditState ? initialData?._id : undefined);
      navigate(ROUTES.movies);
    } catch (error) {
      if (signOutOn401(error)) return;
      setError(error instanceof Error ? error.message : "The movie could not be saved.");
    }
  };

  return (
    <Formik
      initialValues={{ title: initialData?.title || "", year: initialData ? String(initialData.publishYear) : "" }}
      onSubmit={submitForm}
      validationSchema={movieSchema}
    >
      {({ isSubmitting }) => (
        <Form className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ImageUploader
            image={droppedImage}
            currentPosterUrl={currentPosterUrl}
            onFileUpload={setDroppedImage}
            onImageRemove={() => setDroppedImage(undefined)}
          />
          <div className="flex flex-col w-full max-w-sm gap-3">
            {error && <p role="alert" className="text-red-300">{error}</p>}
            <Input name="title" placeholder="Title" />
            <Input name="year" placeholder="Publishing year" inputMode="numeric" />
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => navigate(ROUTES.movies)}>Cancel</Button>
              <Button disabled={isSubmitting} type="submit">{isEditState ? "Update" : "Submit"}</Button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
