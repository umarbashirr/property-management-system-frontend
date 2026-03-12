import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { createProfile } from "@/features/profiles/services/profiles.service";
import type { CreateProfileDto } from "@/features/profiles/types/profiles.types";

export function useCreateProfile() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: CreateProfileDto) => createProfile(dto),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["profiles", "list"] });
      if (result.isDuplicate) {
        toast.warning(
          "A profile with this email/phone may already exist.",
        );
      } else {
        toast.success("Profile created successfully.");
      }
      navigate("/profiles");
    },
  });
}
