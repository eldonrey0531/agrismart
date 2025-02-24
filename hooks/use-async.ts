import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/lib/utils/error-handler';

interface UseAsyncOptions {
  onSuccess?: () => void;
  onError?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useAsync<T extends (...args: any[]) => Promise<any>>(
  asyncFunction: T,
  options: UseAsyncOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const execute = useCallback(
    async (...args: Parameters<T>) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await asyncFunction(...args);
        
        if (options.successMessage) {
          toast({
            description: options.successMessage,
          });
        }
        
        options.onSuccess?.();
        return response;
      } catch (error) {
        setError(error as Error);
        const message = options.errorMessage || getErrorMessage(error);
        
        toast({
          variant: 'destructive',
          title: 'Error',
          description: message,
        });
        
        options.onError?.();
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFunction, options, toast]
  );

  return {
    isLoading,
    error,
    execute,
  };
}