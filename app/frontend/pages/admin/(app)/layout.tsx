import HeaderResponsive from "@/app/frontend/components/common/Header/headerResponsive";

export default function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HeaderResponsive>{children}</HeaderResponsive>;
}
