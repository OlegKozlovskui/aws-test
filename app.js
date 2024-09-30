import express from 'express';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const app = express();
app.use(express.json());

const lambda = new LambdaClient({ region: 'us-east-1' });

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello' });
});

app.post('/tasks', (req, res) => {
  const task = req.body;
  res.status(201).json({ message: 'Task created', task });
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

// Запуск сервера на конкретному порту
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
