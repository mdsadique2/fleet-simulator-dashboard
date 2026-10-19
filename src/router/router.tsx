import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { Vehicle } from '../pages/Vehicle/Vehicle';

export const Navigations = () => (
  <nav>
    <Link to="/" style={{ marginRight: '15px' }}>
      Dashboard
    </Link>
  </nav>
);

const NotFound = () => {
  return (
    <>
      <h2>⚠️ 404 - Page Not Found</h2>
      <Navigations />
    </>
  )
};

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/vehicle/:vehicleId" element={<Vehicle />} />
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
