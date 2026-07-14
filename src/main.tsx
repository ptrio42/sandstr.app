import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Standalone dark-mode handling. In the original repo the parent Astro site
// toggled `dark` on <html> and simulators observed it via useParentTheme.
// Here we own that class ourselves; useParentTheme keeps working unchanged.
const stored = localStorage.getItem('sandstr-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (stored === 'dark' || (!stored && prefersDark)) {
  document.documentElement.classList.add('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
