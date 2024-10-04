import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' });

export const handler = async (event) => {
  const { id } = event.pathParameters;
  const { title, description, status } = JSON.parse(event.body);

  const params = {
    TableName: 'TasksTable',
    Key: {
      id: { S: id },
    },
    UpdateExpression: 'SET #title = :title, #description = :description, #status = :status',
    ExpressionAttributeNames: {
      '#title': 'title',
      '#description': 'description',
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':title': { S: title },
      ':description': { S: description },
      ':status': { S: status },
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    const command = new UpdateCommand(params);
    const data = await client.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Task updated', task: data.Attributes }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not update task' }),
    };
  }
};
