import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const dynamoDbClient = new DynamoDBClient({ region: 'us-east-1' });
const s3Client = new S3Client({ region: 'us-east-1' });
const bucketName = 'advanced-task-manager';

export const handler = async (event) => {
  const { title, description, fileName, fileContent } = JSON.parse(event.body);
  const taskId = uuidv4();

  // Завантаження файлу в S3
  if (fileName && fileContent) {
    const fileParams = {
      Bucket: bucketName,
      Key: `${taskId}/${fileName}`,
      Body: Buffer.from(fileContent, 'base64'),
      ContentEncoding: 'base64',
    };

    try {
      await s3Client.send(new PutObjectCommand(fileParams));
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'File upload failed', details: error.message }),
      };
    }
  }

  // Створення завдання
  const params = {
    TableName: 'TasksTable',
    Item: {
      id: taskId,
      title,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      fileUrl: fileName ? `https://${bucketName}.s3.amazonaws.com/${taskId}/${fileName}` : null,
    },
  };

  try {
    const command = new PutCommand(params);
    await dynamoDbClient.send(command);
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Task created', task: params.Item }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not create task', details: error.message }),
    };
  }
};
