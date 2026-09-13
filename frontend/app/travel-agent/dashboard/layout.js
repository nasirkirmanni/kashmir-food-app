// Signed-in agency dashboard: keep it out of search results.
export const metadata = {
  title: "Agency Dashboard",
  robots: { index: false, follow: false },
};

export default function AgencyDashboardLayout({ children }) {
  return children;
}
