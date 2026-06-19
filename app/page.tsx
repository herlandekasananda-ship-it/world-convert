// app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Mengalihkan rute mentah secara otomatis ke bahasa default (/id)
  redirect('/id');
}