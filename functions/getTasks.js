import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' });

export const handler = async () => {
  const params = {
    TableName: 'TasksTable',
  };

  try {
    const command = new ScanCommand(params);
    const data = await client.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify({ tasks: data.Items }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};
