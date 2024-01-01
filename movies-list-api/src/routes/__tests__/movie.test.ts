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

  test('GET /movies returns a page of the owner\'s movies without poster bytes', async () => {
    const query = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([{ _id: '1', title: 'Movie 1', publishYear: 2020 }]),
    };
    (Movie.find as unknown as jest.Mock).mockReturnValue(query);
    (Movie.countDocuments as unknown as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(11) });

    const response = await request(app)
      .get('/movies?page=2&pageSize=10')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ movies: [{ _id: '1', title: 'Movie 1', publishYear: 2020 }], page: 2, pageSize: 10, total: 11 });
    expect(Movie.find).toHaveBeenCalledWith({ userId: 'user-id' });
    expect(Movie.countDocuments).toHaveBeenCalledWith({ userId: 'user-id' });
    expect(query.select).toHaveBeenCalledWith('-image');
    expect(query.sort).toHaveBeenCalledWith({ _id: -1 });
    expect(query.skip).toHaveBeenCalledWith(10);
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
    { new: true, projection: '-image' },
  );
});

const ID = '658edbd57ff3ddead43bc705';
const chain = (result: unknown) => ({ select: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(result) });

test('GET /movies/:id is owner-scoped and omits the poster', async () => {
  const query = chain(null);
  (Movie.findOne as jest.Mock).mockReturnValue(query);
  const response = await request(createApp()).get(`/movies/${ID}`);
  expect(response.status).toBe(404);
  expect(Movie.findOne).toHaveBeenCalledWith({ _id: ID, userId: 'user-id' });
  expect(query.select).toHaveBeenCalledWith('-image');
});

test('GET /movies/:id/poster streams the stored bytes with their detected type', async () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
  (Movie.findOne as jest.Mock).mockReturnValue(chain({ image: jpeg }));
  const response = await request(createApp()).get(`/movies/${ID}/poster`);
  expect(response.status).toBe(200);
  expect(response.headers['content-type']).toBe('image/jpeg');
  expect(response.headers['x-content-type-options']).toBe('nosniff');
  expect(Buffer.compare(response.body, jpeg)).toBe(0);
  expect(Movie.findOne).toHaveBeenCalledWith({ _id: ID, userId: 'user-id' });
});

test('GET /movies/:id/poster is 404 for another owner\'s movie', async () => {
  (Movie.findOne as jest.Mock).mockReturnValue(chain(null));
  expect((await request(createApp()).get(`/movies/${ID}/poster`)).status).toBe(404);
});

test('DELETE /movies/:id removes only an owned movie', async () => {
  (Movie.deleteOne as jest.Mock).mockReturnValueOnce({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });
  const deleted = await request(createApp()).delete(`/movies/${ID}`);
  expect(deleted.status).toBe(204);
  expect(Movie.deleteOne).toHaveBeenCalledWith({ _id: ID, userId: 'user-id' });

  (Movie.deleteOne as jest.Mock).mockReturnValueOnce({ exec: jest.fn().mockResolvedValue({ deletedCount: 0 }) });
  expect((await request(createApp()).delete(`/movies/${ID}`)).status).toBe(404);
  expect((await request(createApp()).delete('/movies/not-an-id')).status).toBe(400);
});
