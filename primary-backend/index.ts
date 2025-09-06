import express from 'express';

import { health } from './src/health';

const app = express();

app.use(express.json());

app.get('/', health);



app.listen(3000, () => {
  console.log("lesgoooooo");
});
