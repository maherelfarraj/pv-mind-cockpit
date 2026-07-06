import { useLocalSearchParams } from 'expo-router';

import { SummaryScreen } from '@/components/SummaryScreen';
import { findProjectById } from '@/data/mockData';

export default function PVSummaryScreen() {
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();
  const project = findProjectById(projectId);

  return (
    <SummaryScreen
      title="PV Summary"
      subtitle={
        project
          ? `${project.name} PV production, design, and availability snapshot.`
          : 'Portfolio-level PV performance and delivery snapshot.'
      }
      metrics={[
        {
          label: 'Installed capacity',
          value: `${project?.capacityMw ?? 265} MW`,
          detail: 'DC plant size currently tracked in the mobile cockpit.',
        },
        {
          label: 'Performance ratio',
          value: project ? '84.6%' : '85.1%',
          detail: 'Weighted performance ratio against weather-adjusted expectation.',
        },
        {
          label: 'Availability',
          value: `${project?.scadaAvailability ?? 99.2}%`,
          detail: 'SCADA-reported PV availability for the latest operating window.',
        },
      ]}
      focusAreas={[
        'Track inverter imbalance events and underperforming string clusters.',
        'Confirm weather station telemetry quality before next yield closeout.',
        'Prioritize punch-list items affecting energization readiness.',
      ]}
    />
  );
}
