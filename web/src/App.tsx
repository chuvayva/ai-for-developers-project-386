import { Route, Routes } from 'react-router';
import { BookingPage } from './pages/BookingPage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/book" element={<BookingPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
