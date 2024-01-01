import { useEffect, useState } from "react";
import { Button } from "components/Button";
import { ReactComponent as PlusIcon } from "assets/plus-icon.svg";
import { ReactComponent as LogoutIcon } from "assets/logout-icon.svg";
import { MovieCard } from "components/MovieCard";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "constants/routes";
import { getMovies, logout } from "../services/api";

export const Movies = (): JSX.Element => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const userToken = localStorage.getItem('userToken');

      if (!userToken) {
        navigate(ROUTES.signin);
        return;
      }

      try {
        const moviesData = await getMovies(1, 10, userToken);
        setMovies(moviesData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    return () => {
    };
  }, [navigate]);

  const handleEditClick = (movie: any) => {
    navigate(`${ROUTES.editMovie}/${movie._id}`, { state: { movie } });
  };

  const handleLogout = async () => {
    try {
      const userToken = localStorage.getItem('userToken');
      await logout(userToken);
      localStorage.removeItem('userToken');
      navigate(ROUTES.signin);
    } catch (error) {
      console.error(error);
    }
  };

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[100vh]">
        <h1 className="mb-6 text-5xl text-white">Your movie list is empty</h1>
        <Button onClick={() => navigate(ROUTES.newMovie)}>Add a new movie</Button>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="flex items-center justify-between mb-32">
        <span className="flex gap-2 items-center">
          <h1 className="text-5xl text-white">My Movies</h1>
          <button onClick={() => navigate(ROUTES.newMovie)}>
            <PlusIcon className="mt-2" />
          </button>
        </span>
        <button className="flex items-center gap-2 text-white" onClick={handleLogout}>
          Logout <LogoutIcon />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-y-6">
        {movies.map((movie: any) => (
          <MovieCard
            key={movie._id}
            title={movie.title}
            year={movie.publishYear}
            image={(movie.image && movie.image.type === 'Buffer') ? convertBufferToImage(movie.image.data) : ''}
            onEditClick={() => handleEditClick(movie)}
          />
        ))}
      </div>
    </div>
  );
};

// Helper function to convert Buffer to Image
const convertBufferToImage = (buffer: number[]) => {
  const arrayBufferView = new Uint8Array(buffer);
  const blob = new Blob([arrayBufferView], { type: 'image/jpeg' });
  const urlCreator = window.URL || window.webkitURL;
  return urlCreator.createObjectURL(blob);
};
