export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'YYYY-MM-DD HH:mm');
};

export const getOverdueHours = (deadline: string | Date): number => {
  const now = new Date().getTime();
  const dl = new Date(deadline).getTime();
  if (now <= dl) return 0;
  return Math.floor((now - dl) / (1000 * 60 * 60));
};

export const getRemainingTime = (deadline: string | Date): { hours: number; minutes: number; isOverdue: boolean } => {
  const now = new Date().getTime();
  const dl = new Date(deadline).getTime();
  const diff = dl - now;
  
  if (diff <= 0) {
    return { hours: 0, minutes: 0, isOverdue: true };
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes, isOverdue: false };
};

export const formatRemainingTime = (deadline: string | Date): string => {
  const { hours, minutes, isOverdue } = getRemainingTime(deadline);
  if (isOverdue) {
    const overdueHours = getOverdueHours(deadline);
    return `已超时 ${overdueHours} 小时`;
  }
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `剩余 ${days} 天 ${hours % 24} 小时`;
  }
  return `剩余 ${hours} 小时 ${minutes} 分钟`;
};

export const addHours = (date: string | Date, hours: number): string => {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
};

export const addDays = (date: string | Date, days: number): string => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export const addYears = (date: string | Date, years: number): string => {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString();
};

export const getDaysUntilExpiry = (expiryDate: string | Date): number => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getExpiryStatus = (expiryDate: string | Date): { status: 'normal' | 'expiring' | 'expired'; days: number } => {
  const days = getDaysUntilExpiry(expiryDate);
  if (days <= 0) return { status: 'expired', days };
  if (days <= 30) return { status: 'expiring', days };
  return { status: 'normal', days };
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
