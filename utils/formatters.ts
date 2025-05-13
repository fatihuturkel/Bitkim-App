// filepath: src/utils/formatters.ts
// Helper function to format phone number for display or input
export const formatPhoneNumber = (value: string | undefined): string => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, ''); // Remove all non-digit characters
  const N = cleaned.length;

  if (N === 0) return '';
  // Limit to 10 digits for formatting
  const digits = cleaned.substring(0, 10);
  const len = digits.length;

  if (len === 0) return '';
  if (len <= 3) return `(${digits}`;
  
  let formatted = `(${digits.substring(0, 3)}`;
  if (len > 3) {
    formatted += `) ${digits.substring(3, Math.min(6, len))}`;
  }
  if (len > 6) {
    formatted += ` ${digits.substring(6, Math.min(8, len))}`;
  }
  if (len > 8) {
    formatted += ` ${digits.substring(8, Math.min(10, len))}`;
  }
  return formatted;
};

// Helper function to unformat phone number (if you need this in other places too)
export const unformatPhoneNumber = (formattedValue: string | undefined): string => {
  if (!formattedValue) return '';
  return formattedValue.replace(/\D/g, '');
};