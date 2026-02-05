import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // While CSS file creation is restricted, we import the tailwind CDN in HTML, but standard React setup might look for this. We can omit actual CSS file creation and rely on index.html script.

// We don't actually create index.css as per rules, but we ensure the root exists.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
