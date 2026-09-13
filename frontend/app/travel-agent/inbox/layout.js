// Signed-in agency inbox: keep it out of search results.
export const metadata = {
  title: "Agency Inbox",
  robots: { index: false, follow: false },
};

export default function AgencyInboxLayout({ children }) {
  return children;
}
