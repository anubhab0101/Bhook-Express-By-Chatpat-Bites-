import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { SettingsProvider } from "@/context/SettingsContext";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/context/AuthContext";
import { Suspense, lazy, useEffect, useState } from "react";

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const MenuPage = lazy(() => import("@/pages/MenuPage"));
const CartPage = lazy(() => import("@/pages/CartPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));
const LoyaltyPage = lazy(() => import("@/pages/LoyaltyPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const PublicInfoPage = lazy(() => import("@/pages/PublicInfoPage"));
const SetupWizard = lazy(() => import("@/pages/SetupWizard"));
const KitchenPage = lazy(() => import("@/pages/KitchenPage"));
const DeliveryPage = lazy(() => import("@/pages/DeliveryPage"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const MenuManagement = lazy(() => import("@/pages/admin/MenuManagement"));
const OrdersManagement = lazy(() => import("@/pages/admin/OrdersManagement"));
const CustomerManagement = lazy(() => import("@/pages/admin/CustomerManagement"));
const QRManagement = lazy(() => import("@/pages/admin/QRManagement"));
const SettingsPage = lazy(() => import("@/pages/admin/SettingsPage"));
const RewardsManagement = lazy(() => import("@/pages/admin/RewardsManagement"));
const PaymentsPage = lazy(() => import("@/pages/admin/PaymentsPage"));
const AnalyticsPage = lazy(() => import("@/pages/admin/AnalyticsPage"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

const MAX_LOADING_MS = 1500;

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/">
        {() => user ? <MenuPage /> : <LoginPage />}
      </Route>
      <Route path="/menu" component={MenuPage} />
      <Route path="/about" component={PublicInfoPage} />
      <Route path="/contact" component={PublicInfoPage} />
      <Route path="/privacy-policy" component={PublicInfoPage} />
      <Route path="/terms" component={PublicInfoPage} />
      <Route path="/table/:number">
        {(params) => { window.location.replace(`/menu?table=${params.number}`); return null; }}
      </Route>
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CartPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/orders" component={OrdersPage} />
      <Route path="/loyalty" component={LoyaltyPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/setup" component={SetupWizard} />
      <Route path="/kitchen" component={KitchenPage} />
      <Route path="/delivery" component={DeliveryPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/menu" component={MenuManagement} />
      <Route path="/admin/orders" component={OrdersManagement} />
      <Route path="/admin/customers" component={CustomerManagement} />
      <Route path="/admin/rewards" component={RewardsManagement} />
      <Route path="/admin/payments" component={PaymentsPage} />
      <Route path="/admin/analytics" component={AnalyticsPage} />
      <Route path="/admin/qr" component={QRManagement} />
      <Route path="/admin/settings" component={SettingsPage} />
      <Route>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl mb-4">🍽️</p>
            <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
            <a href="/" className="text-primary hover:underline">Back to Home</a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function Layout() {
  const { loading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSplashDone(true), MAX_LOADING_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (loading || !splashDone) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={<LoadingScreen />}>
        <AppRoutes />
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Layout />
            </WouterRouter>
            <Toaster richColors position="top-right" />
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
