import type { MatcherContext } from 'expect';
import type { TestResponse, CustomMatcherResult } from './types/matchers';

/**
 * Success response matcher
 */
function toBeSuccessResponse(
  this: MatcherContext,
  received: unknown,
  expectedData: unknown,
  status = 200
): CustomMatcherResult {
  const testResponse = received as TestResponse;
  const receivedBody = testResponse.body;
  const { isNot } = this;

  const pass = 
    testResponse.status === status &&
    receivedBody.success === true &&
    expect.objectContaining(expectedData).asymmetricMatch(receivedBody.data);

  return {
    pass,
    message: () => {
      const action = isNot ? 'not to' : 'to';
      return [
        `Expected response ${action} be a success response`,
        `Expected status: ${status}`,
        `Received status: ${testResponse.status}`,
        `Expected data: ${JSON.stringify(expectedData)}`,
        `Received data: ${JSON.stringify(receivedBody.data)}`,
      ].join('\n');
    },
  };
}

/**
 * Error response matcher
 */
function toBeErrorResponse(
  this: MatcherContext,
  received: unknown,
  { status, type, message: expectedMessage }:
  { status: number; type: string; message?: string }
): CustomMatcherResult {
  const testResponse = received as TestResponse;
  const receivedBody = testResponse.body;
  const { isNot } = this;

  const pass =
    testResponse.status === status &&
    receivedBody.success === false &&
    receivedBody.type === type &&
    (!expectedMessage || receivedBody.message === expectedMessage);

  return {
    pass,
    message: () => {
      const action = isNot ? 'not to' : 'to';
      return [
        `Expected response ${action} be an error response`,
        `Expected status: ${status}`,
        `Received status: ${testResponse.status}`,
        `Expected type: ${type}`,
        `Received type: ${receivedBody.type}`,
        expectedMessage ? `Expected message: ${expectedMessage}` : null,
        expectedMessage ? `Received message: ${receivedBody.message}` : null,
      ].filter(Boolean).join('\n');
    },
  };
}

/**
 * Valid response matcher
 */
function toBeValidResponse(
  this: MatcherContext,
  received: unknown
): CustomMatcherResult {
  const testResponse = received as TestResponse;
  const { isNot } = this;

  const pass = 'success' in testResponse.body;

  return {
    pass,
    message: () =>
      `Expected response ${isNot ? 'not ' : ''}to be a valid API response`,
  };
}

/**
 * Error type matcher
 */
function toHaveErrorType(
  this: MatcherContext,
  received: unknown,
  type: string
): CustomMatcherResult {
  const testResponse = received as TestResponse;
  const { isNot } = this;

  const pass = testResponse.body.type === type;

  return {
    pass,
    message: () =>
      `Expected response ${isNot ? 'not ' : ''}to have error type "${type}"`,
  };
}

/**
 * Success message matcher
 */
function toHaveSuccessMessage(
  this: MatcherContext,
  received: unknown,
  message: string
): CustomMatcherResult {
  const testResponse = received as TestResponse;
  const { isNot } = this;

  const pass = testResponse.body.message === message;

  return {
    pass,
    message: () =>
      `Expected response ${isNot ? 'not ' : ''}to have message "${message}"`,
  };
}

/**
 * Jest matchers
 */
export const matchers = {
  toBeSuccessResponse,
  toBeErrorResponse,
  toBeValidResponse,
  toHaveErrorType,
  toHaveSuccessMessage,
};

export { type TestResponse };
export default matchers;