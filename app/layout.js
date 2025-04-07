// app/layout.js
import "@fontsource/inter"; // Defaults to weight 400
import "@fontsource/inter/600.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{fontFamily: 'Inter, sans-serif',}}>
        {children}     {/* every page & nested layout gets rendered here */}
      </body>
    </html>
  );
}
