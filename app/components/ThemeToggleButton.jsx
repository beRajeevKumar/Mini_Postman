```javascript
// app/components/ThemeToggleButton.jsx
'use client';

import { useTheme } from './ThemeProvider';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'; // Example icons

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  // Install @heroicons/react if you haven't: npm install @heroicons/react
  // Or use any other icon library or SVGs

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <MoonIcon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
      ) : (
        <SunIcon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
      )}
    </button>
  );
}
```;
