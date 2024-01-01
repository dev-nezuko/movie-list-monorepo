const BASE_URL = process.env.REACT_APP_SERVER_URL;

/**
 * Attempts to log in the user with the provided credentials.
 * @param values - The user credentials (e.g., email and password).
 * @returns A user token if login is successful.
 * @throws Error if login fails.
 */
export const login = async (values: any): Promise<string> => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }
  
      const data = await response.json();
      const userToken = data.token;
  
      return userToken;
    } catch (error) {
      throw new Error("Invalid email or password");
    }
  };

  /**
   * Logs out the user.
   * @param userToken - The user token for authentication.
   * @returns `true` if logout is successful.
   * @throws Error if logout fails.
   */
  export const logout = async (userToken: string | null): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to logout');
      }
  
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  /**
   * Retrieves a list of movies based on pagination parameters.
   * @param page - The page number.
   * @param pageSize - The number of movies to fetch per page.
   * @param userToken - The user token for authentication.
   * @returns A list of movies.
   * @throws Error if fetching movies fails.
   */
  export const getMovies = async (page: number, pageSize: number, userToken: string | null): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/movies?page=${page}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
  
      const data = await response.json();
      return data.movies;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  /**
   * Creates a new movie.
   * @param formData - The form data representing the new movie.
   * @param userToken - The user token for authentication.
   * @returns The response from the server.
   * @throws Error if creating a new movie fails.
   */
  export const createMovie = async (formData: FormData, userToken: string | null): Promise<Response> => {
    try {
      const response = await fetch(`${BASE_URL}/movies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
        body: formData,
      });
  
      return response;
    } catch (error) {
      throw new Error('Failed to create a new movie');
    }
  };
  
  /**
   * Updates an existing movie.
   * @param formData - The form data representing the updated movie.
   * @param userToken - The user token for authentication.
   * @returns The response from the server.
   * @throws Error if updating the movie fails.
   */
  export const updateMovie = async (formData: FormData, userToken: string | null): Promise<Response> => {
    try {
      const response = await fetch(`${BASE_URL}/movies`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
        body: formData,
      });
  
      return response;
    } catch (error) {
      throw new Error('Failed to update the movie');
    }
  };
  