import request from 'supertest';
import express from 'express';
import movieRouter from '../movie';
import Movie from '../../models/movie';

jest.mock('../../models/movie');
jest.mock('../../middlewares/auth', () => ({
  __esModule: true,
  default: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as any).user = { _id: 'user-id' };
    next();
  },
}));

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(movieRouter);
  return app;
};

describe('Movie routes', () => {
  const app = createApp();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /movies returns paginated movies for authenticated user', async () => {
    (Movie.find as unknown as jest.Mock).mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        { _id: '1', title: 'Movie 1', publishYear: 2020 },
      ]),
    });

    const response = await request(app)
      .get('/movies?page=1&pageSize=10')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.movies).toHaveLength(1);
    expect(Movie.find).toHaveBeenCalledWith({ userId: 'user-id' });
  });

  test('GET /movies validates pagination parameters', async () => {
    const response = await request(app)
      .get('/movies?page=0&pageSize=10')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid pagination parameters');
  });

  test('GET /movies/:id returns 400 for invalid id format', async () => {
    const response = await request(app)
      .get('/movies/invalid-id')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid movie ID format');
  });
});



test('oversized image uploads are rejected before persistence', async () => {
  const app=createApp();
  const response=await request(app).post('/movies').field('title','Synthetic').field('publicationYear','2020').attach('image',Buffer.alloc(5*1024*1024+1),{filename:'synthetic.png',contentType:'image/png'});
  expect(response.status).toBe(413);
  expect(response.body.message).toContain('5 MiB');
});

test('oversized and fractional page sizes are rejected', async () => {
  for (const size of ['101','1.5','2oops']) {
    const response=await request(createApp()).get(`/movies?pageSize=${size}`);
    expect(response.status).toBe(400);
  }
});

test('a valid bounded multipart submission is saved for the authenticated owner', async () => {
  const save=jest.fn().mockResolvedValue(undefined);
  (Movie as unknown as jest.Mock).mockImplementation(()=>({save}));
  const response=await request(createApp()).post('/movies').field('title','Synthetic').field('publicationYear','2020').attach('image',Buffer.from('synthetic image bytes'),{filename:'synthetic.png',contentType:'image/png'});
  expect(response.status).toBe(201);expect(save).toHaveBeenCalledTimes(1);
  expect(Movie).toHaveBeenLastCalledWith(expect.objectContaining({userId:'user-id',publishYear:2020}));
});
