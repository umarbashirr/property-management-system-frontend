import { useNavigate } from "react-router";
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RoomType } from "@/features/roomTypes/types/roomTypes.types";

const bedTypeLabels: Record<string, string> = {
  king: "King",
  queen: "Queen",
  twin: "Twin",
  double: "Double",
  single: "Single",
  sofa_bed: "Sofa Bed",
};

const rateFormatter = new Intl.NumberFormat("en-IN", {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface RoomTypeTableProps {
  propertyId: string;
  roomTypes: RoomType[];
  isLoading: boolean;
  onDeleteClick: (roomType: RoomType) => void;
}

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 rounded bg-muted animate-pulse" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function RoomTypeTable({ propertyId, roomTypes, isLoading, onDeleteClick }: RoomTypeTableProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Bed Type</TableHead>
            <TableHead className="text-right">Base Rate</TableHead>
            <TableHead className="text-center">Max Occupancy</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : roomTypes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                No room types found.
              </TableCell>
            </TableRow>
          ) : (
            roomTypes.map((rt) => (
              <TableRow key={rt.id}>
                <TableCell className="font-medium">{rt.name}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-sm">
                  {rt.code}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {bedTypeLabels[rt.bedType] ?? rt.bedType}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {rateFormatter.format(Number(rt.baseRate))}
                </TableCell>
                <TableCell className="text-center">{rt.maxOccupancy}</TableCell>
                <TableCell>
                  <Badge variant={rt.isActive ? "default" : "secondary"}>
                    {rt.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <IconDots size={16} />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => navigate(`/properties/${propertyId}/room-types/${rt.id}`)}
                        className="gap-2"
                      >
                        <IconEdit size={16} />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteClick(rt)}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <IconTrash size={16} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
