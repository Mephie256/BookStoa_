import { auth } from "../../src/lib/auth.js";

export const handler = async (event) => {
  try {
    const headersIn = event.headers || {};
    const proto = headersIn["x-forwarded-proto"] || "https";
    const host = headersIn.host;

    const functionPrefix = "/.netlify/functions/auth";
    const afterFunction = event.path?.startsWith(functionPrefix)
      ? event.path.slice(functionPrefix.length)
      : "";

    const apiPath = `/api/auth${afterFunction}`;
    const query = event.rawQueryString ? `?${event.rawQueryString}` : "";
    const url = `${proto}://${host}${apiPath}${query}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(headersIn)) {
      if (value == null) continue;
      headers.set(key, value);
    }

    let body = undefined;
    if (event.httpMethod !== "GET" && event.httpMethod !== "HEAD") {
      if (event.body != null) {
        body = event.isBase64Encoded
          ? Buffer.from(event.body, "base64")
          : event.body;
      }
    }

    const request = new Request(url, {
      method: event.httpMethod,
      headers,
      body,
    });

    const response = await auth.handler(request);

    const responseHeaders = {};
    const multiValueHeaders = {};

    const setCookie = response.headers.getSetCookie?.();
    if (setCookie && setCookie.length > 0) {
      multiValueHeaders["set-cookie"] = setCookie;
    }

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") return;
      responseHeaders[key] = value;
    });

    const responseBody = await response.text();

    return {
      statusCode: response.status,
      headers: responseHeaders,
      ...(Object.keys(multiValueHeaders).length > 0 ? { multiValueHeaders } : {}),
      body: responseBody,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: error?.message || "Internal server error" }),
    };
  }
};
