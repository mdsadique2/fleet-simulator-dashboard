import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
// import { AppRunner } from '../AppRunner';

import { Dashboard } from '../pages/Dashboard/Dashboard';
// 1. Define your page components
const Home = () => <h2>🏠 Home Page</h2>;
const About = () => <h2>ℹ️ About Page</h2>;
const Contact = () => <h2>📞 Contact Page</h2>;
const NotFound = () => <h2>⚠️ 404 - Page Not Found</h2>;

export const Navigations = () => (
  <nav
    style={{
      padding: '10px',
      background: '#f4f4f4',
      marginBottom: '20px',
    }}
  >
    <Link to="/" style={{ marginRight: '15px' }}>
      Dashboard
    </Link>
    <Link to="/about" style={{ marginRight: '15px' }}>
      About
    </Link>
    <Link to="/contact">Contact</Link>
  </nav>
);

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    {/* Catch-all route for any undefined URLs */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export function Router() {
  return (
    // 2. Wrap your application in BrowserRouter
    <BrowserRouter>
      <div>
        {/* 3. Create navigation links using <Link> instead of <a> */}
        <Navigations />
        <Routes />
        {/* 4. Define your route paths and components inside <Routes> */}
      </div>
    </BrowserRouter>
  );
}

export default Router;
