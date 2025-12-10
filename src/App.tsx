
import { WizardProvider, useWizard } from './context/WizardContext';
import { WizardLayout } from './components/WizardLayout';
import { Step1_Setup } from './components/Step1_Setup';
import { Step2_Exclusions } from './components/Step2_Exclusions';
import { Step3_Draw } from './components/Step3_Draw';

const WizardContent = () => {
  const { step } = useWizard();

  switch (step) {
    case 1:
      return <Step1_Setup />;
    case 2:
      return <Step2_Exclusions />;
    case 3:
      return <Step3_Draw />;
    default:
      return <Step1_Setup />;
  }
};

function App() {
  return (
    <WizardProvider>
      <WizardLayout>
        <WizardContent />
      </WizardLayout>
    </WizardProvider>
  );
}

export default App;
