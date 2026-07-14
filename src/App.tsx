import { Routes, Route } from 'react-router-dom';
import Layout from './host/Layout';
import Gallery from './host/Gallery';
import ClientView from './host/ClientView';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Gallery />} />
        <Route path="/c/:id" element={<ClientView />} />
        <Route path="*" element={<Gallery />} />
      </Route>
    </Routes>
  );
}
