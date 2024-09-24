import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' });

export const handler = async (event) => {
  const { title, description } = JSON.parse(event.body);

  const params = {
    TableName: 'TasksTable',
    Item: {
      id: uuidv4(),
      title,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  };

  try {
    const command = new PutCommand(params);
    await client.send(command);
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Task created', task: params.Item }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};
