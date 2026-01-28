import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const useAuthRedirect = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleCTAClick = useCallback(() => {
    if (isLoading) return;
    
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  return { handleCTAClick, isAuthenticated: !!user, isLoading };
};
