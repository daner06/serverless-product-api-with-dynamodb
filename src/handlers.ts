import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 } from "uuid";
import { docClient, fetchProductById, tableName } from "./db";
import { handleError, headers } from "./http";
import { productSchema } from "./schemas";

export const createProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const reqBody = productSchema.parse(JSON.parse(event.body ?? ""));

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

    const reqBody = productSchema.parse(JSON.parse(event.body ?? ""));

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
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: `product ${id} deleted successfully` }),
    };
  } catch (error) {
    return handleError(error);
  }
};

export const listProducts = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const products = await docClient.send(
      new ScanCommand({
        TableName: tableName,
      }),
    );

    if (!products.Items || products.Items.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([]),
      };
    }

    // For small datasets (like this demo project),
    // it is a good in-memory sorting solution
    // But for bigger datasets use Global Secondary Index (GSI) instead.
    const sorted = products.Items.sort((a, b) =>
      String(a.name ?? "").localeCompare(String(b.name ?? "")),
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(sorted),
    };
  } catch (error) {
    return handleError(error);
  }
};
