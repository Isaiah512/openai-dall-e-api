import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
import addPrompt from './addPrompt.js';
import dotenv from 'dotenv';

dotenv.config();

const configuration = new Configuration({
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = 3080;
let imagesEndpointEnabled = true;

app.post('/', async (req, res) => {
  const { message, aiName, userName } = req.body;
  setTimeout(async () => {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: addPrompt(aiName, userName) + message,
      max_tokens: 1000,
    });
    const responseData = response.data.choices[0].text.trim();
    res.json({
      message: responseData,
    });
  }, 2000);
});

app.post('/images', async (req, res) => {
  if (!imagesEndpointEnabled) {
    res.sendStatus(403); 
    return;
  }

  try {
    const { emoji } = req.body;
    let emotion = '';

    switch (emoji) {
      case '😭':
        emotion = 'sad';
        break;
      case '😁':
        emotion = 'happy';
        break;
      case '😐':
        emotion = 'neutral';
        break;
      case '😍':
        emotion = 'loved';
        break;
      case '😡':
        emotion = 'angry';
        break;
      case '🤮':
        emotion = 'disgusted';
        break;
      default:
        emotion = '';
        break;
    }

    if (!imagesEndpointEnabled) {
      res.json([]); 
      return;
    }

    const response = await openai.createImage({
      // Prompt for the ai image
      prompt: `Humanoid Robot; is ${emoji}`,
      n: 1,
      size: "512x512",
    });
    console.log(response.data.data);
    res.send(response.data.data);
  } catch (error) {
    console.error(error);
    res.sendStatus(500); 
  }
});

app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`);
});