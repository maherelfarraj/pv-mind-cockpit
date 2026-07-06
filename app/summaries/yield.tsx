import { useLocalSearchParams } from 'expo-router';

import { SummaryScreen } from '@/components/SummaryScreen';
import { findProjectById } from '@/data/mockData';

export default function YieldSummaryScreen() {
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();
  const project = findProjectById(projectId);

  return (
    <SummaryScreen
      title="Yield Summary"
      subtitle={
        project
          ? `${project.name} modeled generation and commercial variance summary.`
          : 'Portfolio energy yield and revenue outlook snapshot.'
      }
      metrics={[
        {
          label: 'Annual yield',
          value: `${project?.yieldGWh ?? 591} GWh`,
          detail: 'Expected annual energy output used for current reporting.',
        },
        {
          label: 'Variance to model',
          value: project ? '+1.8%' : '+2.3%',
          detail: 'Difference between actual telemetry and baseline energy model.',
        },
        {
          label: 'Curtailment exposure',
          value: project ? '2.6 GWh' : '6.4 GWh',
          detail: 'Modeled curtailed energy across the latest operating cycle.',
        },
      ]}
      focusAreas={[
        'Compare irradiance normalization before publishing stakeholder reports.',
        'Resolve communications gaps affecting availability-to-yield attribution.',
        'Coordinate with finance on monthly revenue variance narrative.',
      ]}
    />
  );
}
