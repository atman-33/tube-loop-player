import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes';

export const ThemeProvider = (props: ThemeProviderProps) => {
  return <NextThemesProvider {...props}>{props.children}</NextThemesProvider>;
};
