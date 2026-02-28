"use client";

import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useLockArticle, useUnlockArticle } from "@/hooks/useArticles";
import { useAuth } from "@/lib/providers/AuthProvider";
import type { Article } from "@/types";
import { useRouter } from "next/navigation";

interface LockIndicatorProps {
  article: Article;
}

export function LockIndicator({ article }: LockIndicatorProps) {
  const { user } = useAuth();
  const router = useRouter();
  const lockMutation = useLockArticle();
  const unlockMutation = useUnlockArticle();
  const error = lockMutation.error || unlockMutation.error;

  const isLockedByMe =
    article.lock && user && article.lock.lockedBy.id === user.id;
  const isLockedByOther =
    article.lock && user && article.lock.lockedBy.id !== user.id;

  const handleLock = () => {
    lockMutation.mutate(article.id, {
      onSuccess: () => router.refresh(),
    });
  };

  const handleUnlock = () => {
    unlockMutation.mutate(article.id, {
      onSuccess: () => router.refresh(),
    });
  };

  return (
    <div className="space-y-2">
      {error && (
        <Alert
          type="error"
          message={
            error instanceof Error
              ? error.message
              : "Lock operation failed"
          }
        />
      )}

      {article.lock && (
        <div
          className={`rounded-md p-3 text-sm ${
            isLockedByMe
              ? "bg-blue-50 text-blue-800"
              : "bg-orange-50 text-orange-800"
          }`}
        >
          <p>
            🔒 Locked by <strong>{article.lock.lockedBy.name}</strong>
          </p>
          <p className="text-xs mt-1">
            Expires:{" "}
            {new Date(article.lock.expiresAt).toLocaleString()}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {!article.lock && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLock}
            isLoading={lockMutation.isPending}
          >
            Lock for Editing
          </Button>
        )}

        {isLockedByMe && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUnlock}
            isLoading={unlockMutation.isPending}
          >
            Release Lock
          </Button>
        )}

        {isLockedByOther && (
          <Button
            variant="danger"
            size="sm"
            onClick={handleUnlock}
            isLoading={unlockMutation.isPending}
          >
            Force Unlock (Admin)
          </Button>
        )}
      </div>
    </div>
  );
}
