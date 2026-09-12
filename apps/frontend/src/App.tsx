import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage, SignupPage } from "./components/auth/AuthPages";
import { BoardDetailPage, BoardsPage } from "./components/boards/BoardsPage";
import { OrganizationsPage } from "./components/organizations/OrganizationsPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/organizations" element={<OrganizationsPage />} />
      <Route
        path="/organizations/:organizationId/boards"
        element={<BoardsPage />}
      />
      <Route
        path="/organizations/:organizationId/boards/:boardId"
        element={<BoardDetailPage />}
      />
      <Route path="*" element={<Navigate replace to="/login" />} />
    </Routes>
  );
}
