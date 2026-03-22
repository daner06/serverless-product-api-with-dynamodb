import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { HttpError } from "./http";

export const tableName = process.env.PRODUCTS_TABLE ?? "Products";

const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client);

export const fetchProductById = async (id: string) => {
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
