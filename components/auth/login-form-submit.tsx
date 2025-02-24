'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Form } from '@/components/ui/form';
import { useForm, UseFormReturn } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorMessages } from '@/lib/utils/error-handler';

const formSchema = z.object({
  email: z.string().email({
    message: ErrorMessages.VALIDATION.INVALID_EMAIL,
  }),
  password: z.string().min(6, {
    message: ErrorMessages.VALIDATION.PASSWORD_TOO_SHORT,
  }),
});

export type LoginFormValues = z.infer<typeof formSchema>;

interface LoginFormSubmitProps {
  isLoading: boolean;
  onSubmit: (data: LoginFormValues) => Promise<void>;
  children: ((form: UseFormReturn<LoginFormValues>) => React.ReactNode) | React.ReactNode;
}

export function LoginFormSubmit({ isLoading, onSubmit, children }: LoginFormSubmitProps) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid gap-4">
          {typeof children === 'function' ? children(form) : children}
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </Form>
  );
}