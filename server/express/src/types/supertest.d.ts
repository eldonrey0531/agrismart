declare module 'supertest' {
  import { Response as ExpressResponse, Request as ExpressRequest, Application } from 'express';

  export interface Response extends ExpressResponse {
    status: number;
    body: any;
    headers: Record<string, string>;
    type: string;
    charset?: string;
    text: string;
    error?: Error;
    unauthorized: boolean;
    notFound: boolean;
    clientError: boolean;
    serverError: boolean;
    ok: boolean;
    accepted: boolean;
    noContent: boolean;
    badRequest: boolean;
    forbidden: boolean;
    get(header: string): string | undefined;
  }

  export interface Test extends Promise<Response> {
    statusCode: number;
    type: string;
    headers: Record<string, string>;
    set(field: string, val: string): this;
    set(field: { [key: string]: string }): this;
    send(data: any): this;
    attach(field: string, file: string | Buffer, filename?: string): this;
    query(val: object): this;
    field(name: string, val: string | Buffer): this;
    expect(status: number): Test;
    expect(status: number, body: any): Test;
    expect(body: any): Test;
    expect(field: string, val: string): Test;
    end(callback?: (err: Error | null, res: Response) => void): void;
  }

  export interface SuperTest<T extends Test> {
    get(url: string): T;
    post(url: string): T;
    put(url: string): T;
    patch(url: string): T;
    delete(url: string): T;
    del(url: string): T;
    options(url: string): T;
    head(url: string): T;
    trace(url: string): T;
    set(field: string, val: string): this;
    set(field: { [key: string]: string }): this;
    unset(field: string): this;
    timeout(ms: number | string): this;
  }

  export interface SuperTestAPI {
    (app: Application): SuperTest<Test>;
    agent(app: Application): SuperTest<Test>;
  }

  const supertest: SuperTestAPI;
  export default supertest;
}

// Re-export types for convenience
declare module 'supertest/test' {
  export * from 'supertest';
}