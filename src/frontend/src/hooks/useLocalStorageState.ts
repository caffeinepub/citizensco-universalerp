import { useState, useEffect } from 'react';

/**
 * Custom hook to persist state in localStorage with automatic JSON serialization
 * @param key - localStorage key
 * @param defaultValue - default value if no stored value exists
 * @returns [value, setValue] tuple similar to useState
 */
export function useLocalStorageState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch (error) {
      console.error(`Failed to parse localStorage key "${key}":`, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save to localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
}
