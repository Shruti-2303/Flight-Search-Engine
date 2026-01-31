import "./globals.css";
import ThemeProvider from './ThemeProvider';

const SKYLINK_LOGO =
  "https://res.cloudinary.com/ddtemnyax/image/upload/v1769838696/lightLogoNew_tojvtk.png";

export const metadata = {
  title: "Skylink",
  description: "Skylink is a flight search engine that allows you to search for flights and compare prices.",
  icons: {
    icon: SKYLINK_LOGO,
    apple: SKYLINK_LOGO,
  },
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
