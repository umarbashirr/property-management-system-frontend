import { useParams, Link } from "react-router";
import { IconArrowLeft, IconUser } from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TenantForm } from "@/features/tenants/components/TenantForm";
import { StatusBadge } from "@/features/tenants/components/StatusBadge";
import { useTenant } from "@/features/tenants/hooks/useTenant";
import { useTenantUsers } from "@/features/tenants/hooks/useTenantUsers";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" });

function UserRoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {role.replace(/_/g, " ")}
    </span>
  );
}

export function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: tenant, isLoading, isError } = useTenant(id);
  const { data: usersData, isLoading: isUsersLoading } = useTenantUsers(id);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium">Tenant not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This tenant may have been deleted or the ID is invalid.
        </p>
        <Link
          to="/super-admin/tenants"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <IconArrowLeft size={16} />
          Back to tenants
        </Link>
      </div>
    );
  }

  const users = usersData?.data ?? [];

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/super-admin/tenants"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <IconArrowLeft size={16} />
          Back to tenants
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{tenant.name}</h1>
          <StatusBadge status={tenant.status} />
        </div>
        <p className="mt-1 font-mono text-sm text-muted-foreground">{tenant.slug}</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview &amp; Edit</TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5">
            <IconUser size={14} />
            Users
            {!isUsersLoading && usersData && (
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                {usersData.meta.total}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <TenantForm mode="edit" defaultValues={tenant} />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          {isUsersLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        No users found for this tenant.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <UserRoleBadge role={user.role} />
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              user.isActive
                                ? "text-green-700 dark:text-green-400"
                                : "text-muted-foreground"
                            }
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.lastLoginAt
                            ? dateFormatter.format(new Date(user.lastLoginAt))
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
