"use client";

import SectionTitle from "@/components/SectionTitle";
import AdminPanel from "@/components/AdminPanel";
import { useAuth } from "@/context/AuthContext";

export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-shell section-space text-slate-600">Loading...</div>;
  }

  if (!user?.isAdmin) {
    return (
      <div className="page-shell section-space">
        <SectionTitle
          eyebrow="Admin Panel"
          title="Admin access required"
          description="Sign in with the seeded admin account to add dishes, manage restaurants, and flag overpriced places."
        />
      </div>
    );
  }

  return (
    <div className="page-shell section-space">
      <SectionTitle
        eyebrow="Admin Panel"
        title="Manage dishes, restaurants, and authenticity signals"
        description="Use this dashboard to keep the catalog fresh and help tourists avoid weak-value dining choices."
      />
      <div className="mt-10">
        <AdminPanel />
      </div>
    </div>
  );
}
