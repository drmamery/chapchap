import { Suspense } from 'react';
import ProductDetail from './ProductDetail';

export async function generateStaticParams() {
  return [
    { id: 'prod-001' }, { id: 'prod-002' }, { id: 'prod-003' },
    { id: 'prod-004' }, { id: 'prod-005' }, { id: 'prod-006' },
    { id: 'prod-007' }, { id: 'prod-008' }, { id: 'prod-009' },
  ];
}

interface Props { params: { id: string }; }

export default function ProductPage({ params }: Props) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductDetail id={params.id} />
    </Suspense>
  );
}
