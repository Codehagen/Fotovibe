interface FikenInvoiceData {
  orderId: string;
  workspaceId: string;
  amount: number;
  dueDate?: Date;
}

export async function createFikenInvoice(data: FikenInvoiceData) {
  // TODO: Implement Fiken API integration
  return {
    success: true,
    fikenId: `FIKEN_${Date.now()}`, // Placeholder ID
  };
}
