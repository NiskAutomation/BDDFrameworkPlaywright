import { request, APIRequestContext } from '@playwright/test';

export class ApiClient {
  constructor(private requestContext: APIRequestContext) {}

  async get(url: string, headers?: Record<string, string>) {
    return this.requestContext.get(url, { headers });
  }

  async post(url: string, data: any, headers?: Record<string, string>) {
    return this.requestContext.post(url, { data, headers });
  }
}
