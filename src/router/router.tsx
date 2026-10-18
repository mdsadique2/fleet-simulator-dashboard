import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
// import { AppRunner } from '../AppRunner';

import { Dashboard } from '../pages/Dashboard/Dashboard';
// 1. Define your page components
const Vehicle = () => <h2>ℹ️ Vehicle</h2>;
const NotFound = () => <h2>⚠️ 404 - Page Not Found</h2>;

export const Navigations = () => (
  <nav>
    <Link to="/" style={{ marginRight: '15px' }}>
      Dashboard
    </Link>
  </nav>
);

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/vehicle/:id" element={<Vehicle />} />
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
