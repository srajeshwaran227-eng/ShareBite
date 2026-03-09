import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="app-main p-4">
        <Outlet />
      </main>
    </div>
  );
}
