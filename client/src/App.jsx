import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProductDetails from './pages/ProductDetails';

// AppRoutes component for testing (can be wrapped in different routers)
export function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/products/:id" element={<ProductDetails />} />
      </Routes>
    </AuthProvider>
  );
}

// Main App component with Router for production
function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
