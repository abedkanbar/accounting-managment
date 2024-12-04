import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Adherents from "./pages/Adherents";
import Contacts from "./pages/Contacts";
import ComptesBancaires from "./pages/ComptesBancaires";
import AnneesScolaires from "./pages/AnneesScolaires";
import Operations from "./pages/Operations";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./components/AuthProvider";
import { PrivateRoute } from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="adherents" element={<Adherents />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="comptes" element={<ComptesBancaires />} />
            <Route path="operations" element={<Operations />} />
            <Route path="annees-scolaires" element={<AnneesScolaires />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
