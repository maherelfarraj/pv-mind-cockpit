import { useLocalSearchParams } from 'expo-router';

import { SummaryScreen } from '@/components/SummaryScreen';
import { findProjectById } from '@/data/mockData';

export default function BESSSummaryScreen() {
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();
  const project = findProjectById(projectId);

  return (
    <SummaryScreen
      title="BESS Summary"
      subtitle={
        project
          ? `${project.name} storage readiness, dispatch, and auxiliary system snapshot.`
          : 'Portfolio-level storage posture and dispatch readiness.'
      }
      metrics={[
        {
          label: 'Installed energy',
          value: `${project?.bessMWh ?? 108} MWh`,
          detail: 'Nameplate BESS energy capacity covered by current monitoring.',
        },
        {
          label: 'Ready for dispatch',
          value: project ? '94%' : '96%',
          detail: 'Available storage blocks after current maintenance and derates.',
        },
        {
          label: 'Round-trip efficiency',
          value: project ? '87.9%' : '88.6%',
          detail: 'Observed conversion efficiency in the latest dispatch cycle.',
        },
      ]}
      focusAreas={[
        'Review HVAC and auxiliary subsystem preventive maintenance backlog.',
        'Validate dispatch windows against upcoming peak tariff schedules.',
        'Track remaining commissioning punch items on control integrations.',
      ]}
    />
  );
}
