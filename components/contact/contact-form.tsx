import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ContactInput, contactSchema } from '@/lib/validations/form';
import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { FormInput } from '@/components/ui/form-input';

interface ContactFormProps {
  onSubmit: (data: ContactInput) => Promise<void>;
  isLoading?: boolean;
  successMessage?: string;
}

export function ContactForm({
  onSubmit,
  isLoading = false,
  successMessage = 'Thank you for your message. We will get back to you soon.',
}: ContactFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
    mode: 'onBlur', // Validate on blur for better UX
  });

  const handleSubmit = async (data: ContactInput) => {
    try {
      setError(null);
      setSuccess(null);
      await onSubmit(data);
      setSuccess(successMessage);
      form.reset(); // Clear form after successful submission
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
        noValidate
      >
        <div className="grid gap-6 md:grid-cols-2">
          <FormInput
            name="name"
            label="Your Name"
            disabled={isLoading}
            placeholder="John Doe"
            required
          />

          <FormInput
            name="email"
            label="Email Address"
            type="email"
            disabled={isLoading}
            placeholder="john@example.com"
            required
          />
        </div>

        <FormInput
          name="subject"
          label="Subject"
          disabled={isLoading}
          placeholder="How can we help you?"
          required
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Message
                <span className="text-destructive"> *</span>
              </label>
              <textarea
                {...field}
                className="min-h-[160px] w-full rounded-md border border-input px-3 py-2 text-sm"
                placeholder="Please describe your inquiry..."
                disabled={isLoading}
                required
              />
            </div>
          )}
        />

        {error && (
          <div
            className="rounded-md bg-destructive/10 p-4 text-sm text-destructive"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="rounded-md bg-primary/10 p-4 text-sm text-primary"
            role="status"
          >
            {success}
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            * Required fields
          </p>
          <Button
            type="submit"
            disabled={isLoading || !form.formState.isValid}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⌛</span>
                Sending...
              </span>
            ) : (
              'Send Message'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default ContactForm;