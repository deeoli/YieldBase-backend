/**
 * Custom hook for enquiry form handling
 */
import { useState, useEffect } from 'react';
import { Property } from '@/types/property';

interface EnquiryFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface UseEnquiryFormOptions {
  property: Property | null;
  onSubmit?: (data: EnquiryFormData & { propertyId: string }) => Promise<void>;
}

export function useEnquiryForm({ property, onSubmit }: UseEnquiryFormOptions) {
  const [formData, setFormData] = useState<EnquiryFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize message when property changes
  useEffect(() => {
    if (property) {
      setFormData(prev => ({
        ...prev,
        message: `Hi YieldBase team, I'm interested in "${property.title}" (${property.city}, ${property.postcode}). Please share the next steps.`,
      }));
    }
  }, [property]);

  const updateField = (field: keyof EnquiryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (onSubmit) {
        await onSubmit({
          ...formData,
          propertyId: property.id,
        });
      } else {
        // Default submission to /api/enquiry
        const response = await fetch('/api/enquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            propertyId: property.id,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit enquiry');
        }
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '', message: '' });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit enquiry');
      console.error('Error submitting enquiry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setFormData({ name: '', email: '', phone: '', message: '' });
    setSubmitted(false);
    setError(null);
  };

  return {
    formData,
    isSubmitting,
    submitted,
    error,
    updateField,
    handleSubmit,
    reset,
  };
}

