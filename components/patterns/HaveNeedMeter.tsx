import { ProgressMeter } from '@/components/ui/progress-meter';

export function HaveNeedMeter({ have, need, partial = 0 }: { have: number; need: number; partial?: number }) {
  return <ProgressMeter values={{ have, partial, need }} total={have + partial + need} />;
}
