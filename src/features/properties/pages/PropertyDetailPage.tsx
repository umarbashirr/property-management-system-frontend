import { useParams, Link } from "react-router";
import { IconArrowLeft } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { PropertyForm } from "@/features/properties/components/PropertyForm";
import { useProperty } from "@/features/properties/hooks/useProperty";

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading, isError } = useProperty(id);

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
          to="/properties"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <IconArrowLeft size={16} />
          Back to properties
        </Link>
      </div>
    );
  }

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
        <div className="mt-3 flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{property.name}</h1>
          <Badge variant={property.isActive ? "default" : "secondary"}>
            {property.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <p className="mt-1 font-mono text-sm text-muted-foreground">{property.slug}</p>
      </div>

      <PropertyForm mode="edit" defaultValues={property} />
    </div>
  );
}
