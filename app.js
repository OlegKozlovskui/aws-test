import express from 'express';
import cors from 'cors';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import multer from 'multer';
import axios from 'axios';

const app = express();
const upload = multer();
app.use(express.json());

const lambda = new LambdaClient({ region: 'us-east-1' });

// Додаткові опції CORS
const corsOptions = {
  origin: '*', // або замінити на конкретний домен вашого фронтенду
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
};

// Використовуйте cors з опціями
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
const CLIENT_ID = '1u4fm24p0a1h89ne0ufqecgiip';
const CLIENT_SECRET = '1mch48l7a8l3g7ochne15v4c71c7395u6k15th5i6v17orkakim8';
const COGNITO_DOMAIN = 'https://taskmanager-app.auth.us-east-1.amazoncognito.com';
const REDIRECT_URI = 'http://localhost:8080/callback'; // URL, на який Cognito перенаправляє після Google Sign-In

// Маршрут для перенаправлення на Google Sign-In через AWS Cognito
app.get('/auth/google', (req, res) => {
  const url = `${COGNITO_DOMAIN}/oauth2/authorize?identity_provider=Google&response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=email+openid+profile`;
  res.redirect(url);
});

// Маршрут для обробки відповіді від Google і отримання токенів доступу
app.get('/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Отримуємо токени від Cognito
    const response = await axios.post(
      `${COGNITO_DOMAIN}/oauth2/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { id_token, access_token, refresh_token } = response.data;

    // Повертаємо токени у відповіді або обробляємо їх далі
    res.status(200).json({ id_token, access_token, refresh_token });
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.status(500).json({ error: 'Failed to exchange code for tokens' });
  }
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello Cors' });
});

app.get('/tasks', async (req, res) => {
  const command = new InvokeCommand({
    FunctionName: 'task-manager-dev-getTasks',
  });

  try {
    // Виклик Lambda-функції
    const response = await lambda.send(command);
    const responseBody = JSON.parse(Buffer.from(response.Payload).toString());

    // Перетворення відповіді Lambda на формат, який очікує Express.js
    res.status(responseBody.statusCode).json(JSON.parse(responseBody.body));
  } catch (error) {
    console.error('Error invoking Lambda function', error);
    res.status(500).json({ error: 'Could not invoke Lambda function' });
  }
});

app.get('/tasks/:id', async (req, res) => {
  const taskId = req.params.id;

  const command = new InvokeCommand({
    FunctionName: 'task-manager-dev-getTask', // Ім'я вашої Lambda-функції для отримання конкретного завдання
    Payload: JSON.stringify({
      pathParameters: { id: taskId },
    }),
  });

  try {
    const response = await lambda.send(command);
    const responseBody = JSON.parse(Buffer.from(response.Payload).toString());
    res.status(responseBody.statusCode).json(JSON.parse(responseBody.body));
  } catch (error) {
    console.error('Error invoking Lambda function', error);
    res.status(500).json({ error: 'Could not invoke Lambda function' });
  }
});

app.post('/tasks', upload.single('file'), async (req, res) => {
  const { title, description } = req.body;
  const file = req.file;

  // Створюємо об'єкт даних для передачі до Lambda
  const taskData = {
    title,
    description,
  };

  // Якщо файл завантажено, додаємо його в об'єкт
  if (file) {
    taskData.fileName = file.originalname;
    taskData.fileContent = file.buffer.toString('base64'); // Кодуємо файл у формат base64
  }

  const command = new InvokeCommand({
    FunctionName: 'task-manager-dev-createTask', // Замініть на ім'я вашої Lambda-функції
    Payload: JSON.stringify({
      body: JSON.stringify(taskData),
    }),
  });

  try {
    // Виклик Lambda-функції для створення завдання
    const response = await lambda.send(command);
    const responseBody = JSON.parse(Buffer.from(response.Payload).toString());

    // Перетворення відповіді Lambda на формат, який очікує Express.js
    res.status(responseBody.statusCode).json(JSON.parse(responseBody.body));
  } catch (error) {
    console.error('Error invoking Lambda function', error);
    res.status(500).json({ error: 'Could not invoke Lambda function' });
  }
});

// Маршрут для оновлення завдання
app.put('/tasks/:id', async (req, res) => {
  const taskId = req.params.id;
  const updatedTaskData = req.body;

  const command = new InvokeCommand({
    FunctionName: 'task-manager-dev-updateTask', // Ім'я вашої Lambda-функції для оновлення завдання
    Payload: JSON.stringify({
      pathParameters: { id: taskId },
      body: JSON.stringify(updatedTaskData),
    }),
  });

  try {
    const response = await lambda.send(command);
    const responseBody = JSON.parse(Buffer.from(response.Payload).toString());
    res.status(responseBody.statusCode).json(JSON.parse(responseBody.body));
  } catch (error) {
    console.error('Error invoking Lambda function', error);
    res.status(500).json({ error: 'Could not invoke Lambda function' });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  const taskId = req.params.id;

  const command = new InvokeCommand({
    FunctionName: 'task-manager-dev-deleteTask', // Ім'я вашої Lambda-функції для видалення завдання
    Payload: JSON.stringify({
      pathParameters: { id: taskId },
    }),
  });

  try {
    const response = await lambda.send(command);
    const responseBody = JSON.parse(Buffer.from(response.Payload).toString());
    res.status(responseBody.statusCode).json(JSON.parse(responseBody.body));
  } catch (error) {
    console.error('Error invoking Lambda function', error);
    res.status(500).json({ error: 'Could not invoke Lambda function' });
  }
});


// Запуск сервера на конкретному порту
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
