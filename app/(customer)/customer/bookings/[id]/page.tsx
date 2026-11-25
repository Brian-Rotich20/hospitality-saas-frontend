import { BookingDetails } from '../../../../components/bookings/BookingDetails';

export default async function CustomerBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookingDetails id={id} viewer="customer" />;
}
