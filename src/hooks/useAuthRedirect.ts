import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useAuthRedirect = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [storeStatus, setStoreStatus] = useState<{
    checked: boolean;
    hasStore: boolean;
  }>({ checked: false, hasStore: false });

  // Check if user has a store
  useEffect(() => {
    let isMounted = true;

    const checkStore = async () => {
      if (!user) {
        if (isMounted) {
          setStoreStatus({ checked: true, hasStore: false });
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from("stores")
          .select("id")
          .limit(1);

        if (error) throw error;
        
        if (isMounted) {
          setStoreStatus({ 
            checked: true, 
            hasStore: !!(data && data.length > 0) 
          });
        }
      } catch (err) {
        console.error("Error checking store:", err);
        if (isMounted) {
          setStoreStatus({ checked: true, hasStore: false });
        }
      }
    };

    if (!authLoading) {
      checkStore();
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  const handleCTAClick = useCallback(() => {
    if (authLoading || !storeStatus.checked) return;
    
    if (user) {
      navigate(storeStatus.hasStore ? "/dashboard" : "/onboarding");
    } else {
      navigate("/auth");
    }
  }, [user, authLoading, storeStatus, navigate]);

  const isLoading = authLoading || !storeStatus.checked;

  return { 
    handleCTAClick, 
    isAuthenticated: !!user, 
    hasStore: storeStatus.hasStore,
    isLoading
  };
};
