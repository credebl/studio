import type { ReactNode } from "react";

import { EmptyState } from "./EmptyState";
import { Icon, type IconName } from "./icons";

interface DataTableProps {
  columns: string[];
  /** Rows, once there are any. Omitted while the table is still empty. */
  children?: ReactNode;
  empty?: {
    icon: IconName;
    title: string;
    message: string;
    action?: ReactNode;
    /**
     * One line instead of the centred illustration. For a secondary list
     * on a page that already offers the action — the invitations under
     * Members — where the full empty state was a 300px block repeating the
     * page's own "Invite someone" button under a table with nothing in it.
     */
    compact?: boolean;
  };
}

/**
 * A table that keeps its header row when it has nothing to show.
 *
 * The pattern was already in the connections view: the columns tell you what
 * the data will look like before any exists, which an empty state on its own
 * does not. Every list page wants that, so it lives here rather than being
 * retyped — and the horizontal scroll stays on the table's own wrapper, so a
 * wide table never pushes the page sideways.
 */
export function DataTable({ columns, children, empty }: DataTableProps) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="ndi-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          {children ? <tbody>{children}</tbody> : null}
        </table>
      </div>

      {!children && empty?.compact ? (
        <div className="relative z-[4] flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-4">
          <Icon name={empty.icon} size={16} strokeWidth={1.8} className="flex-none text-accent" />
          <p className="m-0 min-w-0 flex-1 text-[13px] leading-[1.55] text-muted">
            <span className="font-medium text-body">{empty.title}.</span> {empty.message}
          </p>
          {empty.action}
        </div>
      ) : !children && empty ? (
        <EmptyState
          icon={empty.icon}
          title={empty.title}
          message={empty.message}
          action={empty.action}
        />
      ) : null}
    </>
  );
}
