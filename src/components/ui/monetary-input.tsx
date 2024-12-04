import React from 'react';
import { Input } from './input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';
import { UseFormReturn } from 'react-hook-form';

interface MonetaryInputProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  decimals?: number;
}

export function MonetaryInput({ form, name, label, decimals = 2 }: MonetaryInputProps) {
  const formatValue = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    return Number(value).toFixed(decimals);
  };

  const parseValue = (value: string): number => {
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : Number(parsed.toFixed(decimals));
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="text"
              value={formatValue(field.value)}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.-]/g, '');
                field.onChange(parseValue(value));
              }}
              onBlur={(e) => {
                const value = parseValue(e.target.value);
                field.onChange(value);
                e.target.value = formatValue(value);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}