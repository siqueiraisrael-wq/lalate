export const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return 'Não informado';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(val);
};

export const formatDate = (isoString: string | null | undefined): string => {
  if (!isoString) return 'Não informado';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Não informado';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return 'Não informado';
  }
};

export const formatDateOnly = (isoString: string | null | undefined): string => {
  if (!isoString) return 'Não informado';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Não informado';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
  } catch {
    return 'Não informado';
  }
};

export const getTimeRemaining = (targetIso: string): { text: string; isUrgent: boolean; isEnded: boolean } => {
  try {
    const now = new Date().getTime();
    const target = new Date(targetIso).getTime();
    const diff = target - now;

    if (diff <= 0) {
      return { text: 'Encerrado', isUrgent: false, isEnded: true };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const days = Math.floor(hours / 24);

    if (days > 1) {
      return { text: `Faltam ${days} dias`, isUrgent: false, isEnded: false };
    }

    if (hours >= 1) {
      return { 
        text: `Faltam ${hours}h ${minutes}m`, 
        isUrgent: hours < 24, 
        isEnded: false 
      };
    }

    return { 
      text: `Faltam apenas ${minutes} min!`, 
      isUrgent: true, 
      isEnded: false 
    };
  } catch {
    return { text: 'Data indefinida', isUrgent: false, isEnded: false };
  }
};
