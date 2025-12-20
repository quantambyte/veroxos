import { OrderBoard } from "@/components/kitchen/order-board";

interface KitchenPageProps {
  params: Promise<{ slug: string }>;
}

export default async function KitchenPage({ params }: KitchenPageProps) {
  const { slug } = await params;

  return <OrderBoard restaurantSlug={slug} />;
}
