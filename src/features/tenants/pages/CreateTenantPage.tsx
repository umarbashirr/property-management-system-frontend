import { Link } from "react-router";
import { IconArrowLeft } from "@tabler/icons-react";
import { TenantForm } from "@/features/tenants/components/TenantForm";

export function CreateTenantPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          to="/super-admin/tenants"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <IconArrowLeft size={16} />
          Back to tenants
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">New tenant</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new tenant and their initial admin account.
        </p>
      </div>

      <TenantForm mode="create" />
    </div>
  );
}
