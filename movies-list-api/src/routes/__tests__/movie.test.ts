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

beforeEach(() => jest.clearAllMocks());

describe('Movie routes', () => {
  const app = createApp();

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

const PNG_BYTES = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.from('synthetic')]);

test('a valid bounded multipart submission is saved for the authenticated owner', async () => {
  const save=jest.fn().mockResolvedValue(undefined);
  (Movie as unknown as jest.Mock).mockImplementation(()=>({save}));
  const response=await request(createApp()).post('/movies').field('title','  Synthetic  ').field('publicationYear','2020').attach('image',PNG_BYTES,{filename:'synthetic.png',contentType:'image/png'});
  expect(response.status).toBe(201);expect(save).toHaveBeenCalledTimes(1);
  expect(Movie).toHaveBeenLastCalledWith(expect.objectContaining({userId:'user-id',publishYear:2020,title:'Synthetic',imageType:'image/png'}));
});

test('a file that only claims to be a PNG is refused with 415', async () => {
  const response=await request(createApp()).post('/movies').field('title','Synthetic').field('publicationYear','2020').attach('image',Buffer.from('<svg/>'),{filename:'poster.png',contentType:'image/png'});
  expect(response.status).toBe(415);
  expect(Movie).not.toHaveBeenCalled();
});

test('blank titles and out-of-range years are rejected on create and update', async () => {
  for (const [title, year] of [['   ','2020'],['Synthetic','20x0'],['Synthetic','1700'],['Synthetic','3000']]) {
    const created=await request(createApp()).post('/movies').field('title',title).field('publicationYear',year).attach('image',PNG_BYTES,{filename:'p.png',contentType:'image/png'});
    expect(created.status).toBe(400);
    const updated=await request(createApp()).put('/movies/658edbd57ff3ddead43bc705').field('title',title).field('publicationYear',year);
    expect(updated.status).toBe(400);
  }
  expect(Movie.findOneAndUpdate).not.toHaveBeenCalled();
});

test('an update without a new poster keeps the stored image', async () => {
  (Movie.findOneAndUpdate as jest.Mock).mockResolvedValue({ _id: '658edbd57ff3ddead43bc705', title: 'Renamed' });
  const response=await request(createApp()).put('/movies/658edbd57ff3ddead43bc705').field('title','Renamed').field('publicationYear','2021');
  expect(response.status).toBe(200);
  expect(Movie.findOneAndUpdate).toHaveBeenCalledWith(
    { _id: '658edbd57ff3ddead43bc705', userId: 'user-id' },
    { $set: { title: 'Renamed', publishYear: 2021 } },
    { new: true },
  );
});
