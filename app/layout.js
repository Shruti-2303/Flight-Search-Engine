import "./globals.css";
import ThemeProvider from './ThemeProvider';

export const metadata = {
  title: "Skylink",
  description: "Skylink is a flight search engine that allows you to search for flights and compare prices.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
