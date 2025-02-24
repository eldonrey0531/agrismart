import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

export const isFetchBaseQueryError = (
  error: unknown
): error is FetchBaseQueryError => {
  return typeof error === 'object' && error != null && 'status' in error;
};

export const isErrorWithMessage = (
  error: unknown
): error is { message: string } => {
  return (
    typeof error === 'object' &&
    error != null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
};

export const getErrorMessage = (error: FetchBaseQueryError | SerializedError) => {
  if (isFetchBaseQueryError(error)) {
    // you can access all properties of `FetchBaseQueryError` here
    const errMsg = 'error' in error ? error.error : JSON.stringify(error.data);
    return errMsg;
  } else if (isErrorWithMessage(error)) {
    // you can access the message property of `SerializedError` here
    return error.message;
  }
  return 'An error occurred';
};
