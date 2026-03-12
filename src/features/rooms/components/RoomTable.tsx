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
import { RoomStatusBadge } from "@/features/rooms/components/RoomStatusBadge";
import type { Room } from "@/features/rooms/types/rooms.types";

interface RoomTableProps {
  propertyId: string;
  rooms: Room[];
  isLoading: boolean;
  onDeleteClick: (room: Room) => void;
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

export function RoomTable({ propertyId, rooms, isLoading, onDeleteClick }: RoomTableProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room No.</TableHead>
            <TableHead>Room Type</TableHead>
            <TableHead>Floor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : rooms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                No rooms found.
              </TableCell>
            </TableRow>
          ) : (
            rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell className="font-medium font-mono">{room.roomNumber}</TableCell>
                <TableCell className="text-muted-foreground">
                  {room.roomType?.name ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {room.floor ?? "—"}
                </TableCell>
                <TableCell>
                  <RoomStatusBadge status={room.status} />
                </TableCell>
                <TableCell>
                  <Badge variant={room.isActive ? "default" : "secondary"}>
                    {room.isActive ? "Active" : "Inactive"}
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
                        onClick={() => navigate(`/properties/${propertyId}/rooms/${room.id}`)}
                        className="gap-2"
                      >
                        <IconEdit size={16} />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteClick(room)}
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
