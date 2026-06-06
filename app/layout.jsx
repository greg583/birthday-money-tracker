import './globals.css'

export const metadata = {
  title: 'Birthday Money Tracker',
  description: 'Track cash contributions for Josh\'s birthday',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
