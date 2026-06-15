import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CartDrawer } from "./components/CartDrawer";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ToastViewport } from "./components/ToastViewport";
import { useAuth } from "./store/auth";

const Home = lazy(() => import("./pages/Home").then((module) => ({ default: module.Home })));
const ProductDetail = lazy(() => import("./pages/ProductDetail").then((module) => ({ default: module.ProductDetail })));
const SellerStore = lazy(() => import("./pages/SellerStore").then((module) => ({ default: module.SellerStore })));
const Sellers = lazy(() => import("./pages/Sellers").then((module) => ({ default: module.Sellers })));
const Favorites = lazy(() => import("./pages/Favorites").then((module) => ({ default: module.Favorites })));

const Checkout = lazy(() => import("./pages/Checkout").then((module) => ({ default: module.Checkout })));
const CheckoutStatus = lazy(() => import("./pages/CheckoutStatus").then((module) => ({ default: module.CheckoutStatus })));
const MyOrders = lazy(() => import("./pages/MyOrders").then((module) => ({ default: module.MyOrders })));
const OrderDetail = lazy(() => import("./pages/OrderDetail").then((module) => ({ default: module.OrderDetail })));

const Login = lazy(() => import("./pages/Login").then((module) => ({ default: module.Login })));
const CustomerRegister = lazy(() => import("./pages/CustomerRegister").then((module) => ({ default: module.CustomerRegister })));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword").then((module) => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import("./pages/ResetPassword").then((module) => ({ default: module.ResetPassword })));
const ArtisanRegister = lazy(() => import("./pages/ArtisanRegister").then((module) => ({ default: module.ArtisanRegister })));

const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard").then((module) => ({ default: module.CustomerDashboard })));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard").then((module) => ({ default: module.SellerDashboard })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then((module) => ({ default: module.AdminDashboard })));
const ArtisanProfile = lazy(() => import("./pages/ArtisanProfile").then((module) => ({ default: module.ArtisanProfile })));
const ArtisanPlans = lazy(() => import("./pages/ArtisanPlans").then((module) => ({ default: module.ArtisanPlans })));
const ArtisanSubscription = lazy(() => import("./pages/ArtisanSubscription").then((module) => ({ default: module.ArtisanSubscription })));
const ArtisanSubscriptionStatus = lazy(() =>
  import("./pages/ArtisanSubscriptionStatus").then((module) => ({ default: module.ArtisanSubscriptionStatus }))
);
const ArtisanOrders = lazy(() => import("./pages/ArtisanOrders").then((module) => ({ default: module.ArtisanOrders })));

function RouteFallback() {
  return (
    <main className="min-h-[55vh] bg-nexus-background">
      <div className="app-shell py-16 text-center text-sm font-bold text-nexus-muted">Carregando...</div>
    </main>
  );
}

export function App() {
  const refreshSession = useAuth((state) => state.refreshSession);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  return (
    <>
      <Header />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produto/:slug" element={<ProductDetail />} />
          <Route path="/loja/:slug" element={<SellerStore />} />
          <Route path="/marcas" element={<Sellers />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/pedido/:id/status" element={<CheckoutStatus />} />
          <Route path="/checkout/:status" element={<CheckoutStatus />} />
          <Route path="/pedido/:status" element={<CheckoutStatus />} />
          <Route path="/meus-pedidos" element={<ProtectedRoute role="CUSTOMER"><MyOrders /></ProtectedRoute>} />
          <Route path="/meus-pedidos/:id" element={<ProtectedRoute role="CUSTOMER"><OrderDetail /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/cliente/login" element={<Login />} />
          <Route path="/cadastro" element={<CustomerRegister />} />
          <Route path="/cliente/cadastro" element={<CustomerRegister />} />
          <Route path="/esqueci-minha-senha" element={<ForgotPassword />} />
          <Route path="/resetar-senha" element={<ResetPassword />} />
          <Route path="/cliente" element={<ProtectedRoute role="CUSTOMER"><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/vendedor/login" element={<Login artisanMode />} />
          <Route path="/vendedor/cadastro" element={<ArtisanRegister />} />
          <Route path="/vendedor/perfil" element={<ProtectedRoute role="ARTISAN"><ArtisanProfile /></ProtectedRoute>} />
          <Route path="/vendedor/planos" element={<ProtectedRoute role="ARTISAN"><ArtisanPlans /></ProtectedRoute>} />
          <Route path="/vendedor/assinatura" element={<ProtectedRoute role="ARTISAN"><ArtisanSubscription /></ProtectedRoute>} />
          <Route path="/vendedor/assinatura/:status" element={<ProtectedRoute role="ARTISAN"><ArtisanSubscriptionStatus /></ProtectedRoute>} />
          <Route path="/vendedor/pedidos" element={<ProtectedRoute role="ARTISAN"><ArtisanOrders /></ProtectedRoute>} />
          <Route path="/vendedor" element={<ProtectedRoute role="ARTISAN"><SellerDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/admin/:section/:id" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/:section" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </Suspense>
      <Footer />
      <CartDrawer />
      <ToastViewport />
    </>
  );
}

function ProtectedRoute({ children, role }: { children: ReactNode; role?: "CUSTOMER" | "ARTISAN" | "ADMIN" }) {
  const user = useAuth((state) => state.user);
  const sessionChecked = useAuth((state) => state.sessionChecked);

  if (!sessionChecked) {
    return <RouteFallback />;
  }

  if (!user || (role && user.role !== role)) {
    const loginPath = role === "ARTISAN" ? "/vendedor/login" : "/login";
    return <Navigate to={loginPath} replace />;
  }

  return <>{children}</>;
}
