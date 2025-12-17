/**
 * Property Enquiry Form Component
 * Reusable form for property enquiries
 */
'use client';

import { Property } from '@/types/property';
import { useEnquiryForm } from '@/hooks/useEnquiryForm';

interface PropertyEnquiryFormProps {
  property: Property | null;
  onSubmit?: (data: { name: string; email: string; phone: string; message: string; propertyId: string }) => Promise<void>;
  onSuccess?: () => void;
}

export default function PropertyEnquiryForm({
  property,
  onSubmit,
  onSuccess,
}: PropertyEnquiryFormProps) {
  const {
    formData,
    isSubmitting,
    submitted,
    error,
    updateField,
    handleSubmit: handleFormSubmit,
  } = useEnquiryForm({
    property,
    onSubmit: async (data) => {
      if (onSubmit) {
        await onSubmit(data);
      }
      if (onSuccess) {
        onSuccess();
      }
    },
  });

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="text-green-600 text-4xl mb-3">✓</div>
        <p className="text-lg font-semibold text-text-dark">Thanks for reaching out!</p>
        <p className="text-text-muted">We&apos;ll get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-dark mb-1">
          Name *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          className="w-full px-4 py-2 border border-border-grey rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-1">
          Email *
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          className="w-full px-4 py-2 border border-border-grey rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-text-dark mb-1">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          className="w-full px-4 py-2 border border-border-grey rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-text-dark mb-1">
          Message *
        </label>
        <textarea
          id="message"
          required
          rows={4}
          value={formData.message}
          onChange={(e) => updateField('message', e.target.value)}
          className="w-full px-4 py-2 border border-border-grey rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
      </button>
    </form>
  );
}

