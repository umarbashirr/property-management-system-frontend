import { Link, useSearchParams } from "react-router";
import { IconArrowLeft, IconBuildingSkyscraper } from "@tabler/icons-react";
import { PropertyForm } from "@/features/properties/components/PropertyForm";

export function CreatePropertyPage() {
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get("tenantId") ?? undefined;

  const backTo = tenantId ? `/properties?tenantId=${tenantId}` : "/properties";

  return (
    <div className="mx-auto max-w-3xl pb-12">
      {/* Navigation */}
      <Link
        to={backTo}
        className="group mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconArrowLeft
          size={16}
          className="transition-transform group-hover:-translate-x-0.5"
        />
        Back to properties
      </Link>

      {/* Page header */}
      <div className="mb-10 flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <IconBuildingSkyscraper size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create a new property
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Set up a hotel, resort, or lodging property. You can always update
            these details later.
          </p>
        </div>
      </div>

      {/* Form */}
      <PropertyForm mode="create" tenantId={tenantId} />
    </div>
  );
}
