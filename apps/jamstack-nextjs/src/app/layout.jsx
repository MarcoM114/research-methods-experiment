import '../../../../shared/styles.css';

export const metadata = {
  title: 'Academic Assessment Management System – Jamstack Benchmark',
  description: 'Empirical Performance Evaluation of Jamstack Web Application Architectures (Next.js SSG vs. Astro Islands)'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
