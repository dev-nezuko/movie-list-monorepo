import { MovieForm } from "components/MovieForm";

export const NewMovie = () => {
  return (
    <div className="main-container">
      <h1 className="mb-32 text-5xl text-white">Create a new movie</h1>
      <MovieForm />
    </div>
  );
};
