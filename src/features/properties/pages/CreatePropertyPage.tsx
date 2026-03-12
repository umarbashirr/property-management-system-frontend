import { Link } from "react-router";
import { IconArrowLeft } from "@tabler/icons-react";
import { PropertyForm } from "@/features/properties/components/PropertyForm";

export function CreatePropertyPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          to="/properties"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <IconArrowLeft size={16} />
          Back to properties
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">New property</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new hotel property to your account.
        </p>
      </div>

      <PropertyForm mode="create" />
    </div>
  );
}
