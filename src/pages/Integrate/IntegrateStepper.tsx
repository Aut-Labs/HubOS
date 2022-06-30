import Stepper from '@components/Stepper';
import { Step } from '@components/Stepper/model';
import { useEffect, useState } from 'react';
import { StepWizardChildProps } from 'react-step-wizard';
import CommunityInfoStep from './CommunityInfoStep';
import ImportContractStep from './ImportContractStep';
import SelectMarketStep from './SelectMarketStep';
import RoleStep from './RoleStep';
import CommitmentStep from './CommitmentStep';
import ConfirmStep from './ConfirmStep';

const steps: Step[] = [
  {
    component: ImportContractStep,
    title: 'Import Contract',
    description: (
      <div>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
        erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus
        est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet
      </div>
    ),
  },
  {
    component: CommunityInfoStep,
    title: 'Community Details',
    description: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam',
  },
  {
    component: SelectMarketStep,
    title: 'Select Market',
    description: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam',
  },
  {
    component: RoleStep,
    title: 'Roles',
    description: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam',
  },
  {
    component: CommitmentStep,
    title: 'Commitment',
    description: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam',
  },
  {
    component: ConfirmStep,
    title: 'Confirm',
    description: '',
  },
];

const IntegrateStepper = (props) => {
  const [instance, setInstance] = useState<StepWizardChildProps & any>();

  useEffect(() => {
    props.instance(() => instance);
  }, [instance]);

  return <Stepper instance={setInstance} steps={steps} />;
};

export default IntegrateStepper;
