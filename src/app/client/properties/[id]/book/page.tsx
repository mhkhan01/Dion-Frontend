import BookPropertyClient from './BookPropertyClient';

export const dynamic = 'error';
export const dynamicParams = false;

export async function generateStaticParams() {
  return [{id: 'placeholder'}];
}

export default function BookPropertyPage() {
  return <BookPropertyClient />;
}
