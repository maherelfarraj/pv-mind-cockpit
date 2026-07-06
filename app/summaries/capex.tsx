import { useLocalSearchParams } from 'expo-router';

import { SummaryScreen } from '@/components/SummaryScreen';
import { APP_NAME } from '@/constants/branding';
import { findProjectById } from '@/data/mockData';

export default function CAPEXSummaryScreen() {
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();
  const project = findProjectById(projectId);

  return (
    <SummaryScreen
      title="CAPEX Summary"
      subtitle={
        project
          ? `${project.name} commercial delivery and spending snapshot.`
          : 'Portfolio capital delivery and contingency tracking snapshot.'
      }
      metrics={[
        {
          label: 'Budget tracked',
          value: `$${project?.capexUsdM ?? 208}M`,
          detail: `Current project or portfolio CAPEX tracked in ${APP_NAME}.`,
        },
        {
          label: 'Contingency remaining',
          value: project ? '4.2%' : '5.1%',
          detail: 'Estimated remaining contingency after open procurement actions.',
        },
        {
          label: 'Committed spend',
          value: project ? '81%' : '77%',
          detail: 'Share of total EPC budget already committed or invoiced.',
        },
      ]}
      focusAreas={[
        'Monitor long-lead electrical package purchase order releases.',
        'Confirm variation order impacts before monthly governance review.',
        'Align cash-flow forecast with latest site mobilization plan.',
      ]}
    />
  );
}
