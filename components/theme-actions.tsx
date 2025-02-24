'use client';

import { Icons } from './ui/icons';
import { ButtonWrapper } from './ui/button-wrapper';

interface ThemeActionProps {
  theme: string;
  onThemeSelect: (theme: string) => void;
}

export function ThemeActions({ theme, onThemeSelect }: ThemeActionProps) {
  const items = [
    { theme: 'light', icon: Icons.sun, label: 'Light' },
    { theme: 'dark', icon: Icons.moon, label: 'Dark' },
    { theme: 'system', icon: Icons.laptop, label: 'System' },
  ];

  return (
    <>
      {items.map(({ theme: themeValue, icon: Icon, label }) => (
        <ButtonWrapper
          key={themeValue}
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClickHandler={() => onThemeSelect(themeValue)}
        >
          <Icon className="mr-2 h-4 w-4" />
          <span>{label}</span>
        </ButtonWrapper>
      ))}
    </>
  );
}