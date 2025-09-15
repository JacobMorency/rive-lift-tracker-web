"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/authcontext";
import supabase from "@/app/lib/supabaseClient";
import { toast } from "sonner";
import { User, Check } from "lucide-react";

const CompleteProfilePage = () => {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (userData && userData.first_name && userData.last_name) {
      router.push("/workouts");
      return;
    }

    if (userData) {
      setFirstName(userData.first_name || "");
      setLastName(userData.last_name || "");
    }
  }, [user, userData, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user) return;

    setLoading(true);
    try {
      const { error: upsertErr } = await supabase.from("users").upsert(
        {
          id: user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
        { onConflict: "id" }
      );
      if (upsertErr) throw upsertErr;

      toast.success("Profile completed successfully!");
      router.push("/workouts");
    } catch (error: any) {
      toast.error(
        error.message || "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-base-200">
      <div className="w-full max-w-md">
        <div className="bg-base-100 rounded-lg shadow-lg p-6 space-y-6">
          <div className="text-center">
            <div className="bg-primary shrink-0 rounded-full h-20 w-20 flex items-center justify-center text-5xl mx-auto mb-4">
              <User className="size-10 text-primary-content" />
            </div>
            <h2 className="text-2xl font-bold text-base-content">
              Complete Your Profile
            </h2>
            <p className="text-base-content/60 mt-2">
              Welcome! Please complete your profile to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">First Name</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) setErrors({ ...errors, firstName: "" });
                }}
                className={`input input-bordered w-full ${
                  errors.firstName ? "input-error" : ""
                }`}
                placeholder="Enter your first name"
                autoFocus
              />
              {errors.firstName && (
                <p className="text-error text-sm mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="label">
                <span className="label-text">Last Name</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) setErrors({ ...errors, lastName: "" });
                }}
                className={`input input-bordered w-full ${
                  errors.lastName ? "input-error" : ""
                }`}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="text-error text-sm mt-1">{errors.lastName}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <Check className="size-4 mr-2" />
                  Complete Profile
                </>
              )}
            </button>
          </form>

          <div className="bg-info/10 border border-info/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-info/20 rounded-full p-1 mt-0.5">
                <User className="size-4 text-info" />
              </div>
              <div>
                <h4 className="font-medium text-info mb-1">
                  Profile Information
                </h4>
                <p className="text-sm text-base-content/70">
                  This information will be used to personalize your experience
                  and help you track your fitness journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
