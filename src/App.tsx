import { Navigate, Route, Routes } from 'react-router-dom';
import { Shell } from './components/Shell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EditorPage } from './pages/EditorPage';
import { GalleryPage } from './pages/GalleryPage';
import { CreditsPage } from './pages/CreditsPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Shell />}>
        <Route index element={<DashboardPage />} />
        <Route path="new" element={<EditorPage />} />
        <Route path="characters/:id" element={<EditorPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="credits" element={<CreditsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
