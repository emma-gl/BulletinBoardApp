const statusCodes = require('http').STATUS_CODES;
const httpConstants = require('http2').constants;
// Load the AWS SDK for Node.js.
var AWS = require("aws-sdk");
// Set the AWS Region.
AWS.config.update({ region: "us-east-1" });

// Create DynamoDB service object.
var dynamodb = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10", endpoint: 'https://local-host/8000'});

exports.events = function (req, res) {
  let id = req.query.id;
  if (id) {
      dynamodb.query({TableName: 'event', Key: {id: id}}, (err, data) => {
          if (err) {
              console.log(err);
              res.send(err);
          } else {
              res.send(data.Item);
          }
      });
  } else {
      dynamodb.scan({TableName: 'event'}, (err, data) => {
          if (err) {
              console.log(err);
              res.send(err);
          } else {
              res.json(data.Items);
          }
      });
  }
};

exports.event = function (req, res) {
  let body = req.body;
  let id = req.params.eventId;
  if (id && req.method === httpConstants.HTTP2_METHOD_DELETE) {

let params = {"TableName": "event", "Key": {id: Number(id)}};

    dynamodb.delete(params, (err, data) => {
          if (err) {
              console.log(`this is the error ${err}`);
              res.send(err);
          } else {
              res.send(data);
          }
      });
  } else  if (req.method === httpConstants.HTTP2_METHOD_POST && body.title.trim()) {

    body.id = Date.now();

    // Create JSON object with parameters for DynamoDB and store in a variable
    let params = {
        TableName:'event',
        Item: body
    };
        // writes to DynamoDB table
       dynamodb.put(params, function(err, data) {
            if (err) {
              console.log("Error", err);
            } else {
            //   console.log("Success", this.httpResponse);
            res.status(httpConstants.HTTP_STATUS_OK).send(data);
            }
          }); 
        }
};