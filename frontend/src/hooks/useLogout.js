import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { logout } from "../lib/api";

function useLogout() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });

  return { logoutMutation: mutate };
}

export default useLogout;
