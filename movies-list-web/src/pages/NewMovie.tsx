import { MovieForm } from "components/MovieForm";

export const NewMovie = () => {
  return (
    <div className="main-container">
      <h1 className="mb-10 text-4xl sm:text-5xl text-ink">Add a movie</h1>
      <MovieForm />
    </div>
  );
};
