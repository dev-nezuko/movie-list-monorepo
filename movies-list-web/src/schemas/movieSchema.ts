import * as Yup from "yup";

// Mirrors the API's checks in movies-list-api/src/validation/movie.ts.
export const movieSchema = Yup.object().shape({
  title: Yup.string().trim().required("Please enter movie title").max(200, "Keep the title under 200 characters"),
  year: Yup.number()
    .typeError("Please enter a numeric year")
    .integer("Please enter a whole year")
    .min(1888, "Films start in 1888")
    .max(new Date().getFullYear() + 5, "That year is too far ahead")
    .required("Please enter publishing year"),
});
