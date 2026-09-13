export const metadata = {
  alternates: { canonical: "https://wazwanway.com/signup" },
  title: "Sign Up",
  description: "Create an account on Wazwan Way to unlock restaurant maps, bookmark authentic dishes, and share your dining experiences in Kashmir.",
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    url: "https://wazwanway.com/signup",
    siteName: "Wazwan Way",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
  },
};

export default function SignupLayout({ children }) {
  return children;
}
