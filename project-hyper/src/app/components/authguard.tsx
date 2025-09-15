"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/authcontext";

type AuthGuardProps = {
  children: React.ReactNode;
};

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Not authenticated → go to login
    if (!user) {
      if (pathname !== "/login") router.push("/login");
      return;
    }

    // Authenticated but profile incomplete → go to complete-profile (avoid redirect loop)
    const isProfileIncomplete =
      !userData || !userData.first_name || !userData.last_name;
    if (isProfileIncomplete && pathname !== "/complete-profile") {
      router.push("/complete-profile");
      return;
    }
  }, [user, userData, loading, router, pathname]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Don't render children if user is not authenticated
  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
