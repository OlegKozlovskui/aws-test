import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' });

function formatDynamoDBResponse(tasks) {
  if (Array.isArray(tasks)) {
    return tasks.map((task) => {
      return Object.keys(task).reduce((formattedTask, key) => {
        // Перевіряємо, чи є ключ "S" і витягуємо його значення
        formattedTask[key] = task[key].S;
        return formattedTask;
      }, {});
    });
  }
  return [];
}

export const handler = async () => {
  const params = {
    TableName: 'TasksTable',
  };

  try {
    const command = new ScanCommand(params);
    const data = await client.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify({ tasks: formatDynamoDBResponse(data.Items) }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};
