import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import RequireAuth   from "@/components/RequireAuth.jsx";
import Layout        from "@/components/Layout.jsx";  // ← Add this import

import LoginPage     from "@/pages/LoginPage.jsx";
import RegisterPage  from "@/pages/RegisterPage.jsx";

import DashboardPage   from "@/pages/DashboardPage.jsx";
import ExpensesPage    from "@/pages/ExpensesPage.jsx";
import ExpenseFormPage from "@/pages/ExpenseFormPage.jsx";
import SettingsPage    from "@/pages/SettingsPage.jsx";

import NotFoundPage    from "@/pages/NotFoundPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---------- ROOT ---------- */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ---------- PUBLIC ---------- */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ---------- PROTECTED ---------- */}
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>  {/* ← Add this wrapper */}
            <Route path="/dashboard"         element={<DashboardPage />} />
            <Route path="/expenses"          element={<ExpensesPage />} />
            <Route path="/expenses/new"      element={<ExpenseFormPage />} />
            <Route path="/expenses/:id/edit" element={<ExpenseFormPage />} />
            <Route path="/settings"          element={<SettingsPage />} />
          </Route>  {/* ← Close the wrapper */}
        </Route>

        {/* ---------- 404 ---------- */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}