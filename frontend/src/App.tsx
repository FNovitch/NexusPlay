import { Route, Routes } from "react-router-dom";
import { CartDrawer } from "./components/CartDrawer";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ToastViewport } from "./components/ToastViewport";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Checkout } from "./pages/Checkout";
import { CheckoutStatus } from "./pages/CheckoutStatus";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { ProductDetail } from "./pages/ProductDetail";
import { SellerDashboard } from "./pages/SellerDashboard";
import { Sellers } from "./pages/Sellers";
import { SellerStore } from "./pages/SellerStore";

export function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produto/:slug" element={<ProductDetail />} />
        <Route path="/loja/:slug" element={<SellerStore />} />
        <Route path="/artesaos" element={<Sellers />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/:status" element={<CheckoutStatus />} />
        <Route path="/login" element={<Login />} />
        <Route path="/vendedor" element={<SellerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <Footer />
      <CartDrawer />
      <ToastViewport />
    </>
  );
}
