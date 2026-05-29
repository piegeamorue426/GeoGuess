'use client';

import { useState, useMemo } from 'react';
import { GameMode } from '@geoguess/shared';

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia',
  'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados',
  'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina',
  'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia',
  'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland',
  'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala',
  'Guinea', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia',
  'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan',
  'Kenya', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia',
  'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia',
  'Maldives', 'Mali', 'Malta', 'Mauritania', 'Mauritius', 'Mexico', 'Moldova', 'Monaco',
  'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea',
  'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Panama', 'Papua New Guinea',
  'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia',
  'Rwanda', 'Saudi Arabia', 'Senegal', 'Serbia', 'Sierra Leone', 'Singapore', 'Slovakia',
  'Slovenia', 'Somalia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan',
  'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania',
  'Thailand', 'Togo', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
  'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
];

interface CountryGuessProps {
  onSubmit: (country: string) => void;
  streak: number;
  disabled?: boolean;
}

export function CountryGuess({ onSubmit, streak, disabled = false }: CountryGuessProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return COUNTRIES;
    const lower = query.toLowerCase();
    return COUNTRIES.filter((c) => c.toLowerCase().includes(lower));
  }, [query]);

  function handleSelect(country: string) {
    setQuery(country);
    setIsOpen(false);
    onSubmit(country);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && query.trim()) {
      const match = filtered.find(
        (c) => c.toLowerCase() === query.trim().toLowerCase()
      );
      if (match) {
        handleSelect(match);
      } else if (filtered.length === 1) {
        handleSelect(filtered[0]);
      }
    }
  }

  return (
    <div className="bg-surface rounded-lg p-4 shadow-lg border border-white/10">
      {/* Streak counter */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">Country Streak</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Streak</span>
          <span className="text-2xl font-bold text-primary">{streak}</span>
        </div>
      </div>

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Type a country name..."
          disabled={disabled}
          className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Dropdown */}
        {isOpen && !disabled && filtered.length > 0 && (
          <div className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-black/90 border border-white/20 rounded-lg shadow-xl">
            {filtered.slice(0, 20).map((country) => (
              <button
                key={country}
                onClick={() => handleSelect(country)}
                className="w-full px-4 py-2 text-left text-white hover:bg-primary/20 transition-colors text-sm"
              >
                {country}
              </button>
            ))}
            {filtered.length > 20 && (
              <div className="px-4 py-2 text-xs text-gray-500 text-center">
                {filtered.length - 20} more results...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit button */}
      <button
        onClick={() => {
          const match = filtered.find(
            (c) => c.toLowerCase() === query.trim().toLowerCase()
          );
          if (match) handleSelect(match);
        }}
        disabled={disabled || !query.trim()}
        className="mt-3 w-full py-2 bg-primary hover:bg-primary/80 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit Guess
      </button>
    </div>
  );
}
