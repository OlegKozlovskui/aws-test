import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' });

export const handler = async (event) => {
  const { id } = event.pathParameters;

  const params = {
    TableName: 'TasksTable',
    Key: {
      id,
    },
  };

  try {
    const command = new DeleteCommand(params);
    await client.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Task deleted', id }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not delete task' }),
    };
  }
};
