import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import CharityProtectedRoute from "./components/CharityProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BusinessOnboarding from "./pages/BusinessOnboarding";
import CharityOnboarding from "./pages/CharityOnboarding";
import AddProduct from "./pages/AddProduct";
import AddDonation from "./pages/AddDonation";
import EditProduct from "./pages/EditProduct";
import Checkout from "./pages/Checkout";
import Order from "./pages/Order";
import "./App.css";
import Marketplace from "./pages/Marketplace";
import Landing from "./pages/Landing";
import Donate from "./pages/Donate";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import Orders from "./pages/Orders";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/donate"
              element={
                <CharityProtectedRoute>
                  <Donate />
                </CharityProtectedRoute>
              }
            />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/orders" element={<Orders />} />
            <Route
              path="/checkout/:id"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order/:id"
              element={
                <ProtectedRoute>
                  <Order />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RestaurantDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add"
              element={
                <ProtectedRoute>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donation/add"
              element={
                <ProtectedRoute>
                  <AddDonation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute>
                  <EditProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/business"
              element={
                <ProtectedRoute>
                  <BusinessOnboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/charity"
              element={
                <ProtectedRoute>
                  <CharityOnboarding />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
