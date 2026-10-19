import './globals.css';

export const metadata = {
  title: 'Choose your own GenAIdventure',
  description: 'CSC-603 Capstone Project',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
