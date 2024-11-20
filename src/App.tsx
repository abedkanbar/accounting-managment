import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Adherents from './pages/Adherents';
import Contacts from './pages/Contacts';
import ComptesBancaires from './pages/ComptesBancaires';
import Cotisations from './pages/Cotisations';
import CotisationsEcole from './pages/CotisationsEcole';
import AnneesScolaires from './pages/AnneesScolaires';
import Operations from './pages/Operations';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="adherents" element={<Adherents />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="comptes" element={<ComptesBancaires />} />
          <Route path="cotisations" element={<Cotisations />} />
          <Route path="operations" element={<Operations />} />
          <Route path="cotisations-ecole" element={<CotisationsEcole />} />
          <Route path="annees-scolaires" element={<AnneesScolaires />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;