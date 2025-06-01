const { EntitySchema } = require("@mikro-orm/core");

class RequestHistory {
  constructor(
    method,
    url,
    requestHeaders,
    requestBody,
    responseStatus,
    responseHeaders,
    responseBody
  ) {
    this.method = method;
    this.url = url;
    this.requestHeaders = requestHeaders;
    this.requestBody = requestBody;
    this.responseStatus = responseStatus;
    this.responseHeaders = responseHeaders;
    this.responseBody = responseBody;
    this.createdAt = new Date();
  }
}

const schema = new EntitySchema({
  class: RequestHistory,
  tableName: "request_history",
  properties: {
    id: { type: "number", primary: true, autoincrement: true },
    method: { type: "string" },
    url: { type: "string", length: 2048 },
    requestHeaders: { type: "json", nullable: true },
    requestBody: { type: "text", nullable: true },
    responseStatus: { type: "number", nullable: true },
    responseHeaders: { type: "json", nullable: true },
    responseBody: { type: "text", nullable: true },
    createdAt: { type: "Date" },
  },
});

module.exports = {
  RequestHistory,
  RequestHistorySchema: schema,
};
