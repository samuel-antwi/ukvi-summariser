'use client';

import { VISA_ROUTES } from '@/lib/constants';
import { VisaRouteId } from '@/types';

interface VisaSelectorProps {
  value: VisaRouteId | null;
  onChange: (visaRouteId: VisaRouteId) => void;
  disabled?: boolean;
}

export function VisaSelector({ value, onChange, disabled }: VisaSelectorProps) {
  return (
    <div className="w-full">
      <label
        htmlFor="visa-route"
        className="block text-sm font-medium mb-2"
      >
        Select a visa route
      </label>
      <select
        id="visa-route"
        value={value || ''}
        onChange={(e) => onChange(e.target.value as VisaRouteId)}
        disabled={disabled}
        className="w-full px-4 py-3 border border-foreground/20 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Choose a visa type...</option>
        {VISA_ROUTES.map((route) => (
          <option key={route.id} value={route.id}>
            {route.name}
          </option>
        ))}
      </select>
    </div>
  );
}
