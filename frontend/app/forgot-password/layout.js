export const metadata = {
  alternates: { canonical: "https://wazwanway.com/forgot-password" },
  title: "Reset Password",
  description: "Recover your Wazwan Way account password to continue exploring Kashmiri food maps and recipes.",
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    url: "https://wazwanway.com/forgot-password",
    siteName: "Wazwan Way",
    images: [{ url: "/wazwan-hero.jpg", width: 1024, height: 1024, alt: "Wazwan Way" }],
  },
};

export default function ForgotPasswordLayout({ children }) {
  return children;
}
