import { DynamoDBClient, DeleteCommand } from '@aws-sdk/client-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' });

export const handler = async (event) => {
  const { id } = event.pathParameters;

  const params = {
    TableName: 'TasksTable',
    Key: {
      id: { S: id },
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
