import * as Yup from "yup";

export const movieSchema = Yup.object().shape({
  title: Yup.string().required("Please enter movie title"),
  year: Yup.string().required("Please enter publishing year"),
});
