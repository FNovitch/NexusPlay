import { Route, Routes } from "react-router-dom";
import { CartDrawer } from "./components/CartDrawer";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ToastViewport } from "./components/ToastViewport";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminLogin } from "./pages/AdminLogin";
import { ArtisanOrders } from "./pages/ArtisanOrders";
import { ArtisanProfile } from "./pages/ArtisanProfile";
import { ArtisanPlans } from "./pages/ArtisanPlans";
import { ArtisanRegister } from "./pages/ArtisanRegister";
import { ArtisanSubscription } from "./pages/ArtisanSubscription";
import { ArtisanSubscriptionStatus } from "./pages/ArtisanSubscriptionStatus";
import { Checkout } from "./pages/Checkout";
import { CheckoutStatus } from "./pages/CheckoutStatus";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { CustomerRegister } from "./pages/CustomerRegister";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { MyOrders } from "./pages/MyOrders";
import { OrderDetail } from "./pages/OrderDetail";
import { ProductDetail } from "./pages/ProductDetail";
import { ResetPassword } from "./pages/ResetPassword";
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
        <Route path="/pedido/:status" element={<CheckoutStatus />} />
        <Route path="/meus-pedidos" element={<MyOrders />} />
        <Route path="/meus-pedidos/:id" element={<OrderDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cliente/login" element={<Login />} />
        <Route path="/cadastro" element={<CustomerRegister />} />
        <Route path="/cliente/cadastro" element={<CustomerRegister />} />
        <Route path="/esqueci-minha-senha" element={<ForgotPassword />} />
        <Route path="/resetar-senha" element={<ResetPassword />} />
        <Route path="/cliente" element={<CustomerDashboard />} />
        <Route path="/artesao/login" element={<Login artisanMode />} />
        <Route path="/artesao/cadastro" element={<ArtisanRegister />} />
        <Route path="/artesao/perfil" element={<ArtisanProfile />} />
        <Route path="/artesao/planos" element={<ArtisanPlans />} />
        <Route path="/artesao/assinatura" element={<ArtisanSubscription />} />
        <Route path="/artesao/assinatura/:status" element={<ArtisanSubscriptionStatus />} />
        <Route path="/artesao/pedidos" element={<ArtisanOrders />} />
        <Route path="/vendedor" element={<SellerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/:section" element={<AdminDashboard />} />
      </Routes>
      <Footer />
      <CartDrawer />
      <ToastViewport />
    </>
  );
}
