import type { ArticleStatusType } from "@/types";
import { ArticleStatus } from "@/types";

const statusConfig: Record<
  ArticleStatusType,
  { label: string; className: string }
> = {
  [ArticleStatus.DRAFT]: {
    label: "Draft",
    className: "bg-gray-100 text-gray-800",
  },
  [ArticleStatus.IN_REVIEW]: {
    label: "In Review",
    className: "bg-yellow-100 text-yellow-800",
  },
  [ArticleStatus.PUBLISHED]: {
    label: "Published",
    className: "bg-green-100 text-green-800",
  },
  [ArticleStatus.ARCHIVED]: {
    label: "Archived",
    className: "bg-red-100 text-red-800",
  },
};

export function StatusBadge({ status }: { status: ArticleStatusType }) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
