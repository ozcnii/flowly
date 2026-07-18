import { EnrollmentScreen } from "@/features/programs/ui/enrollment-screen";

export default async function EnrollmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EnrollmentScreen id={id} />;
}
