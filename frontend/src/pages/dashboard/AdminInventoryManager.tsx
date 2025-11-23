import InventoryManager from '@/components/Inventory/InventoryManager';

const AdminInventoryManager = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventory Management</h1>
      <InventoryManager />
    </div>
  );
};

export default AdminInventoryManager;
