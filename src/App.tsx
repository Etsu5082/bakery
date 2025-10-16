import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Materials } from './pages/Materials';
import { Recipes } from './pages/Recipes';
import { CostCalculation } from './pages/CostCalculation';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

/**
 * メインアプリケーションコンポーネント
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="materials" element={<Materials />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="cost-calculation" element={<CostCalculation />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
