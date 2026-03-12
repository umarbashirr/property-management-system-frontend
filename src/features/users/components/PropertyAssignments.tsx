import { useState } from "react";
import {
  IconBuildingEstate,
  IconLoader,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { UserRoleBadge } from "@/features/users/components/UserRoleBadge";
import { useAssignProperty } from "@/features/users/hooks/useAssignProperty";
import { useRemovePropertyAssignment } from "@/features/users/hooks/useRemovePropertyAssignment";
import { useProperties } from "@/features/properties/hooks/useProperties";
import type { AssignPropertyDto, PropertyAssignment } from "@/features/users/types/users.types";

const staffRoles = [
  { value: "tenant_admin", label: "Tenant Admin" },
  { value: "property_manager", label: "Property Manager" },
  { value: "front_desk", label: "Front Desk" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "accountant", label: "Accountant" },
] as const;

interface PropertyAssignmentsProps {
  userId: string;
  assignments: readonly PropertyAssignment[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PropertyAssignments({ userId, assignments }: PropertyAssignmentsProps) {
  const { data: propertiesData } = useProperties({ limit: 100 });
  const assignMutation = useAssignProperty(userId);
  const removeMutation = useRemovePropertyAssignment(userId);

  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const assignedPropertyIds = new Set(assignments.map((a) => a.propertyId));
  const availableProperties = (propertiesData?.data ?? []).filter(
    (p) => p.isActive && !assignedPropertyIds.has(p.id)
  );

  function handleAssign() {
    if (!selectedPropertyId) return;
    assignMutation.mutate(
      {
        propertyId: selectedPropertyId,
        ...(selectedRole ? { role: selectedRole as AssignPropertyDto["role"] } : {}),
      },
      {
        onSuccess: () => {
          setSelectedPropertyId("");
          setSelectedRole("");
        },
      }
    );
  }

  function handleRemove(propertyId: string) {
    removeMutation.mutate(propertyId);
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <IconBuildingEstate size={18} />
          </div>
          <div>
            <CardTitle>Property assignments</CardTitle>
            <CardDescription>
              Manage which properties this staff member has access to.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Current assignments table */}
        {assignments.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Role Override</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow key={a.propertyId}>
                    <TableCell className="font-medium">{a.propertyName}</TableCell>
                    <TableCell>
                      {a.role ? (
                        <UserRoleBadge role={a.role} />
                      ) : (
                        <Badge variant="outline">Default</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(a.assignedAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        disabled={removeMutation.isPending}
                        onClick={() => handleRemove(a.propertyId)}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No property assignments yet.
          </p>
        )}

        {/* Assign new property */}
        {availableProperties.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Property</p>
                <Select
                  value={selectedPropertyId}
                  onValueChange={(v) => setSelectedPropertyId(v ?? "")}
                  items={availableProperties.map((p) => ({ value: p.id, label: p.name }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProperties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-44">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Role override</p>
                <Select
                  value={selectedRole || "default"}
                  onValueChange={(v) => setSelectedRole(v === "default" ? "" : v ?? "")}
                  items={[
                    { value: "default", label: "Default (inherit)" },
                    ...staffRoles.map((r) => ({ value: r.value, label: r.label })),
                  ]}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default (inherit)</SelectItem>
                    {staffRoles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                size="sm"
                disabled={!selectedPropertyId || assignMutation.isPending}
                onClick={handleAssign}
                className="gap-1.5"
              >
                {assignMutation.isPending ? (
                  <IconLoader size={14} className="animate-spin" />
                ) : (
                  <IconPlus size={14} />
                )}
                Assign
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
