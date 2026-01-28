import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useAuthRedirect = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [hasStore, setHasStore] = useState<boolean | null>(null);
  const [isCheckingStore, setIsCheckingStore] = useState(false);

  // Check if user has a store
  useEffect(() => {
    const checkStore = async () => {
      if (!user) {
        setHasStore(null);
        return;
      }

      setIsCheckingStore(true);
      try {
        const { data, error } = await supabase
          .from("stores")
          .select("id")
          .limit(1);

        if (error) throw error;
        setHasStore(data && data.length > 0);
      } catch (err) {
        console.error("Error checking store:", err);
        setHasStore(false);
      } finally {
        setIsCheckingStore(false);
      }
    };

    if (user && !isLoading) {
      checkStore();
    }
  }, [user, isLoading]);

  const handleCTAClick = useCallback(() => {
    if (isLoading || isCheckingStore) return;
    
    if (user) {
      // If user has a store, go to dashboard; otherwise go to onboarding
      if (hasStore) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } else {
      navigate("/auth");
    }
  }, [user, isLoading, isCheckingStore, hasStore, navigate]);

  return { 
    handleCTAClick, 
    isAuthenticated: !!user, 
    hasStore,
    isLoading: isLoading || isCheckingStore 
  };
};
