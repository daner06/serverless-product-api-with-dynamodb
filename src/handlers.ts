import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 } from "uuid";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.PRODUCTS_TABLE ?? "Products";
const headers = {
  "Content-Type": "application/json",
};

class HttpError extends Error {
  constructor(public statusCode: number, body: Record<string, unknown>) {
    super(JSON.stringify(body));
  }
}

const handleError = (error: unknown) => {
  if (error instanceof HttpError) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify(error.message),
      headers,
    };
  }
  throw error;
};

const fetchProductById = async (id: string) => {
  const output = await docClient.send(
    new GetCommand({
      TableName: tableName,
      Key: { productID: id },
    }),
  );

  if (!output.Item) {
    throw new HttpError(404, { error: "not found" });
  }

  return output.Item;
};

export const createProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const reqBody = JSON.parse(event.body as string);

    const product = {
      ...reqBody,
      productID: v4(),
    };

    await docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: product,
      }),
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(product),
    };
  } catch (error) {
    return handleError(error);
  }
};

export const getProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const product = await fetchProductById(event.pathParameters?.id as string);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(product),
    };
  } catch (error) {
    return handleError(error);
  }
};

export const updateProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id as string;
    await fetchProductById(id);

    const reqBody = JSON.parse(event.body as string);

    const product = {
      ...reqBody,
      productID: id,
    };

    await docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: product,
      }),
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(product),
    };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id as string;
    await fetchProductById(id);

    await docClient.send(
      new DeleteCommand({
        TableName: tableName,
        Key: { productID: id },
      }),
    );

    return {
      statusCode: 204,
      headers,
      body: JSON.stringify({ message: "product deleted successfully" }),
    };
  } catch (error) {
    return handleError(error);
  }
};

export const listProducts = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const products = await docClient.send(
      new ScanCommand({
        TableName: tableName,
      }),
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(products.Items),
    };
  } catch (error) {
    return handleError(error);
  }
};
