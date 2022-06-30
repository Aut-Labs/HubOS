import { useState } from 'react';
import { StepWizardChildProps } from 'react-step-wizard';
import { Button, Toolbar } from '@mui/material';
import { ReactComponent as AutLogo } from '@assets/aut/logo.svg';
import { ReactComponent as BackIcon } from '@assets/aut/back.svg';
import { pxToRem } from '@utils/text-size';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import IntegrateStepper from './IntegrateStepper';
import IntegrateSuccess from './IntegrateSuccess';

const Integrate = () => {
  const { path } = useRouteMatch();
  const history = useHistory();
  const [instance, setInstance] = useState<StepWizardChildProps>();
  const goBack = () => {
    if (instance?.currentStep === 1) {
      history.push('/');
    } else if (!instance || path.includes('success')) {
      history.push('/integrate');
    } else {
      instance?.previousStep();
    }
  };
  return (
    <>
      <Toolbar
        sx={{
          p: '0px !important',
          height: `${pxToRem(120)}`,
          minHeight: `${pxToRem(120)}`,
          maxHeight: `${pxToRem(120)}, !important`,
          justifyContent: 'center',
        }}
      >
        <Button
          sx={{
            color: 'white',
            position: 'absolute',
            left: pxToRem(140),
            top: pxToRem(40),
          }}
          type="button"
          onClick={goBack}
          startIcon={<BackIcon style={{ height: pxToRem(34), width: pxToRem(28) }} />}
          variant="text"
        >
          Back
        </Button>
        <AutLogo width="80" height="80" />
      </Toolbar>
      <Switch>
        <Route exact path={path} render={() => <IntegrateStepper instance={setInstance} />} />
        <Route path={`${path}/success`} component={IntegrateSuccess} />
      </Switch>
    </>
  );
};

export default Integrate;
