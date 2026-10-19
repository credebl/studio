import type { Metadata } from "next";

import { ApproveDesignationView } from "@/features/designation/ApproveDesignationView";

export const metadata: Metadata = { title: "Designation — NDI administration" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApproveDesignationView id={decodeURIComponent(id)} />;
}
