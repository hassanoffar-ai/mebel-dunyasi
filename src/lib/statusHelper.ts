export const toDbStatus = (status: string): string => {
  const map: Record<string, string> = {
    pending: 'yeni',
    confirmed: 'hazirlanir',
    processing: 'hazirlanir',
    shipped: 'gonderildi',
    delivered: 'catdirildi',
    cancelled: 'legv_edildi',
  };
  return map[status] || status;
};

export const toClientStatus = (status: string): string => {
  const map: Record<string, string> = {
    yeni: 'pending',
    hazirlanir: 'confirmed', // Map hazirlanir back to confirmed (or processing depending on context)
    gonderildi: 'shipped',
    catdirildi: 'delivered',
    legv_edildi: 'cancelled',
  };
  return map[status] || status;
};
