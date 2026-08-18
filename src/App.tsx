import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './host/Layout';
import Gallery from './host/Gallery';
import ClientView from './host/ClientView';

// Lazy: /compare pulls in eight clients' note cards and their theme sheets, and
// nobody landing on the gallery should pay for that.
const CompareView = lazy(() => import('./host/compare/CompareView'));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Gallery />} />
        <Route path="/c/:id" element={<ClientView />} />
        <Route
          path="/compare"
          element={
            <Suspense fallback={<div className="p-10 text-sm text-gray-500">Loading…</div>}>
              <CompareView />
            </Suspense>
          }
        />
        <Route path="*" element={<Gallery />} />
      </Route>
    </Routes>
  );
}
