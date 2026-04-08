import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { RequireAuth } from "../../features/auth/ui/RequireAuth";
import { RedirectIfAuthenticated } from "../../features/auth/ui/RedirectIfAuthenticated";
import { DashboardPage } from "../../pages/DashboardPage";
import { KinshipPage } from "../../pages/KinshipPage";
import { LoginPage } from "../../pages/LoginPage";
import { PersonPage } from "../../pages/PersonPage";
import { RegisterPage } from "../../pages/RegisterPage";
import { RelationshipsPage } from "../../pages/RelationshipsPage";
import { TreePage } from "../../pages/TreePage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuthenticated>
              <RegisterPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/trees/:treeId"
          element={
            <RequireAuth>
              <TreePage />
            </RequireAuth>
          }
        />
        <Route
          path="/persons/:personId"
          element={
            <RequireAuth>
              <PersonPage />
            </RequireAuth>
          }
        />
        <Route
          path="/relationships"
          element={
            <RequireAuth>
              <RelationshipsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/kinship"
          element={
            <RequireAuth>
              <KinshipPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
