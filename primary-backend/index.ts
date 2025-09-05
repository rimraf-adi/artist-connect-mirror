import express, { Request, Response } from 'express';
import { response } from './src/types';

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response<response<null>>) => {
  const response: response<null> = {
    success: true,
    message: "sab changa si",
    data: null
  };
  res.status(200).json(response);
});



app.listen(3000, () => {
  console.log("lesgoooooo");
});
