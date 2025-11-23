// Minimal DashboardLayout for root `src` project
// The full-featured layout lives under `frontend/src/components/DashboardLayout.tsx`.
// This placeholder avoids importing shadcn/ui components and other project aliases
// that are only present in the `frontend` app and cause compile errors in the root project.

export const DashboardLayout = ({ children, role }: { children?: any; role?: string }) => {
  // Return children directly (no JSX) to avoid requiring React types in root project.
  return (children as any) || null;
};
