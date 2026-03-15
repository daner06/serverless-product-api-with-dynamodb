# Serverless - AWS Node.js Typescript

Simple HTTP serverless application using Typescript AWS DynamoDB.

## Install

`yarn install`

## Deployment

`yarn deploy`

## Manual tests

Replace the url with the right url from the output of the deployment:

Add new product:
`
curl -X POST "https://4g9f8qxnv0.execute-api.eu-west-2.amazonaws.com/product" \
  -H "Content-Type: application/json" \
  -d '{"name":"iPhone X","description":"mobile phone","price":899}'
`

Get details of a product:
`
curl "https://4g9f8qxnv0.execute-api.eu-west-2.amazonaws.com/product/fa7cf126-0d62-4f85-831f-1e25f3bf5320"
`

Update a product:

`
curl -X PUT "https://4g9f8qxnv0.execute-api.eu-west-2.amazonaws.com/product/fa7cf126-0d62-4f85-831f-1e25f3bf5320" \
  -H "Content-Type: application/json" \
  -d '{"price":1000}'
`

Get the list of products:

`curl "https://4g9f8qxnv0.execute-api.eu-west-2.amazonaws.com/product"`

example of output:
`
[
  {
    "price":{
      "N":"1000"
    },
    "productID":{
      "S":"fa7cf126-0d62-4f85-831f-1e25f3bf5320"
    }
  }
]

Delete a product:
`curl -X DELETE "https://4g9f8qxnv0.execute-api.eu-west-2.amazonaws.com/product/fa7cf126-0d62-4f85-831f-1e25f3bf5320"`


