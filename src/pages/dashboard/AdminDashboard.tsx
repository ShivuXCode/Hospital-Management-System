/**
 * Minimal AdminDashboard for the root `src` app.
 * This file avoids importing React or using JSX so it doesn't require React
 * type declarations to be present in the root project. It returns null so the
 * app can render without pulling in the full frontend UI stack.
 */
const AdminDashboard = function AdminDashboard(): null {
  // Intentionally minimal placeholder to avoid dependency errors in root project.
  return null;
};

export default AdminDashboard as unknown as (() => null);
