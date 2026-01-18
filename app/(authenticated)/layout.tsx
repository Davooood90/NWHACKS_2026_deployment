import Footer from "@/components/Footer";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Each authenticated page provides its own navbar for flexibility
  return (
    <>
      {children} <Footer />
    </>
  );
}
