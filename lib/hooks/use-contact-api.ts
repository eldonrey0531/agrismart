import { useApiMutation } from './use-api';
import { ContactInput } from '@/lib/validations/form';

interface ContactResponse {
  message: string;
  ticketId: string;
}

export function useContactApi() {
  // Submit contact form
  const submitContact = useApiMutation<ContactResponse, ContactInput>(
    '/contact',
    {
      onSuccess: (data) => {
        // Log analytics event
        if (window.gtag) {
          window.gtag('event', 'contact_form_submission', {
            ticket_id: data.data.ticketId,
          });
        }
      },
    }
  );

  // Submit support ticket
  const submitSupportTicket = useApiMutation<
    ContactResponse,
    ContactInput & {
      category: 'general' | 'technical' | 'billing' | 'other';
      priority: 'low' | 'medium' | 'high';
      attachments?: File[];
    }
  >('/contact/support', {
    onSuccess: (data) => {
      // Log analytics event
      if (window.gtag) {
        window.gtag('event', 'support_ticket_submission', {
          ticket_id: data.data.ticketId,
        });
      }
    },
  });

  // Get ticket status
  const getTicketStatus = useApiMutation<
    {
      status: 'pending' | 'in-progress' | 'resolved';
      lastUpdate: string;
      assignedTo?: string;
    },
    {
      ticketId: string;
    }
  >('/contact/ticket-status');

  // Add message to existing ticket
  const addTicketMessage = useApiMutation<
    {
      message: string;
      timestamp: string;
    },
    {
      ticketId: string;
      message: string;
      attachments?: File[];
    }
  >('/contact/ticket-message');

  // Close ticket
  const closeTicket = useApiMutation<
    { message: string },
    {
      ticketId: string;
      reason?: string;
      rating?: 1 | 2 | 3 | 4 | 5;
      feedback?: string;
    }
  >('/contact/close-ticket');

  return {
    submitContact,
    submitSupportTicket,
    getTicketStatus,
    addTicketMessage,
    closeTicket,
  };
}

// Add window.gtag type definition
declare global {
  interface Window {
    gtag?: (
      command: 'event',
      action: string,
      params: Record<string, any>
    ) => void;
  }
}

export default useContactApi;