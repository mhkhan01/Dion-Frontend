export const dynamicParams = false;

export async function generateStaticParams() {
  return [{id: 'placeholder'}];
}

export default function PropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

