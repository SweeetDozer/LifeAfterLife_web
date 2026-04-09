import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../../shared/api/auth";
import { useSession } from "../../features/auth/model/session-context";

export function AppLayout() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { logout, status } = useSession();

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-kicker">LifeAfterLife</p>
          <h1 className="app-title">Frontend aligned with OpenAPI</h1>
        </div>
        <div className="app-status">
          <strong>Status</strong>
          <span>{status}</span>
        </div>
      </header>

      <div className="app-body">
        <aside className="app-sidebar">
          <nav className="app-nav">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
            <NavLink to="/relationships">Relationships</NavLink>
            <NavLink to="/kinship">Kinship</NavLink>
            {accessToken ? (
              <button className="ghost" type="button" onClick={logout}>
                Logout
              </button>
            ) : null}
          </nav>
        </aside>

        <section className="app-content">
          <Outlet />
        </section>
      </div>
    </main>
  );
}
