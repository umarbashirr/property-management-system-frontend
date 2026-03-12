import { useParams, Link, useSearchParams } from "react-router";
import { IconArrowLeft, IconBuildingSkyscraper } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { PropertyForm } from "@/features/properties/components/PropertyForm";
import { useProperty } from "@/features/properties/hooks/useProperty";

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get("tenantId") ?? undefined;

  const { data: property, isLoading, isError } = useProperty(id, tenantId);

  const backTo = tenantId ? `/properties?tenantId=${tenantId}` : "/properties";

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium">Property not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This property may have been deleted or the ID is invalid.
        </p>
        <Link
          to={backTo}
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <IconArrowLeft size={16} />
          Back to properties
        </Link>
      </div>
    );
  }

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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {property.name}
            </h1>
            <Badge variant={property.isActive ? "default" : "secondary"}>
              {property.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Update your property details, location, and contact information.
          </p>
        </div>
      </div>

      {/* Form */}
      <PropertyForm mode="edit" defaultValues={property} tenantId={tenantId} />
    </div>
  );
}
