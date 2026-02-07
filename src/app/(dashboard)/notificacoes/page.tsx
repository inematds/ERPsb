import { Bell } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

export default function NotificacoesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notificacoes</h1>
      <EmptyState
        icon={Bell}
        title="Nenhuma notificacao"
        description="Quando houver novidades como PIX recebido ou alertas financeiros, elas aparecerão aqui"
      />
    </div>
  );
}
