"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { toggleFollow } from "@/lib/actions/follows";
import { cn } from "@/lib/utils";

export function FollowButton({
  builderId,
  initialFollowing,
  isAuthed,
  redirectTo,
}: {
  builderId: string;
  initialFollowing: boolean;
  isAuthed: boolean;
  redirectTo: string;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [, startTransition] = useTransition();

  function onClick() {
    if (!isAuthed) {
      router.push(`/login?next=${encodeURIComponent(redirectTo)}`);
      return;
    }
    const next = !following;
    setFollowing(next);
    startTransition(async () => {
      const res = await toggleFollow(builderId);
      if (!res.ok) {
        setFollowing(!next);
        if (res.error === "auth")
          router.push(`/login?next=${encodeURIComponent(redirectTo)}`);
        else if (res.error !== "self")
          toast.error("Couldn't update follow. Please try again.");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={following}
      className={cn("btn btn-sm", following ? "btn-ghost" : "btn-primary")}
    >
      {following ? (
        <>
          <UserCheck size={15} /> Following
        </>
      ) : (
        <>
          <UserPlus size={15} /> Follow
        </>
      )}
    </button>
  );
}
