import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function CharityProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.userType !== "charity" && user.userType !== "business") {
    return <Navigate to="/" replace />;
  }

  if (!user.isOnboardingCompleted && user.userType === "charity") {
    return <Navigate to="/onboarding/charity" replace />;
  }

  return children;
}
