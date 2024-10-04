import { DynamoDBClient,  } from '@aws-sdk/client-dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' });

function formatDynamoDBResponse(task) {
  return Object.keys(task).reduce((formattedTask, key) => {
    // Перевіряємо, чи є ключ "S" і витягуємо його значення
    formattedTask[key] = task[key].S;
    return formattedTask;
  }, {});
}

export const handler = async (event) => {
  const taskId = event.pathParameters.id; // Отримуємо ID з параметрів шляху

  const params = {
    TableName: 'TasksTable',
    Key: {
      id: taskId, // Використовуємо ID завдання для пошуку
    },
  };

  try {
    const command = new GetCommand(params);
    const data = await client.send(command);

    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Task not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ task: formatDynamoDBResponse(data.Item) }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not retrieve task', details: error.message }),
    };
  }
};

