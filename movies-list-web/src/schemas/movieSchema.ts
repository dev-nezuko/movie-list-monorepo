import * as Yup from "yup";

export const movieSchema = Yup.object().shape({
  title: Yup.string().required("Please enter movie title"),
  year: Yup.number().typeError("Please enter a numeric year").integer("Please enter a whole year").positive("Please enter a positive year").required("Please enter publishing year"),
});
