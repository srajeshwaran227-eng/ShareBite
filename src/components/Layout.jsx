import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="app-container">
      <main className="app-main">
        <Outlet />
      </main>
      <Navbar />
    </div>
  );
}
