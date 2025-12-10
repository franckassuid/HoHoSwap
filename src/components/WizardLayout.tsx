import { useState } from 'react';
import { useWizard } from '../context/WizardContext';
import { Users, Ban, Mail } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import clsx from 'clsx';

interface StepIndicatorProps {
    currentStep: number;
}

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
    const steps = [
        { num: 1, label: 'Configuration', icon: Users },
        { num: 2, label: 'Exclusions', icon: Ban },
        { num: 3, label: 'Tirage', icon: Mail },
    ];

    return (
        <div className="flex justify-center mb-8">
            {steps.map((s, idx) => {
                const isActive = currentStep === s.num;
                const isCompleted = currentStep > s.num;
                const Icon = s.icon;

                return (
                    <div key={s.num} className="flex items-center">
                        <div className={clsx(
                            "flex flex-col items-center mx-2 md:mx-4 transition-colors duration-300",
                            isActive ? "text-red-600" : isCompleted ? "text-green-600" : "text-gray-400"
                        )}>
                            <div className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2",
                                isActive ? "border-red-600 bg-red-50" : isCompleted ? "border-green-600 bg-green-50" : "border-gray-200"
                            )}>
                                <Icon size={20} />
                            </div>
                            <span className="text-xs font-medium hidden md:block">{s.label}</span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={clsx(
                                "h-1 w-8 md:w-16",
                                isCompleted ? "bg-green-600" : "bg-gray-200"
                            )} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export const WizardLayout = ({ children }: { children: React.ReactNode }) => {
    const { step, setStep } = useWizard();
    const [isHomeModalOpen, setIsHomeModalOpen] = useState(false);

    const handleLogoClick = () => {
        // Navigate to home (Scenario: user wants to go back to dashboard/setup)
        if (step > 1) {
            setIsHomeModalOpen(true);
        } else {
            setStep(1); // Already at 1, just ensure
        }
    };

    const confirmGoHome = () => {
        setStep(1);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-red-600 text-white p-4 shadow-md sticky top-0 z-20">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div
                        onClick={handleLogoClick}
                        className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity"
                        title="Retour à l'accueil"
                    >
                        <img
                            src="/logo.png"
                            alt="HoHoSwap Logo"
                            className="w-16 h-16 object-contain drop-shadow-md"
                        />
                        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">HoHoSwap</h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8">
                <StepIndicator currentStep={step} />

                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 text-center text-slate-400 text-sm">
                <p>Développé avec ❤️ pour Noël</p>
            </footer>

            <ConfirmationModal
                isOpen={isHomeModalOpen}
                onClose={() => setIsHomeModalOpen(false)}
                onConfirm={confirmGoHome}
                title="Retour à l'accueil"
                message="Voulez-vous vraiment revenir à l'accueil ? Votre avancement actuel (participants, exclusions) sera conservé dans l'historique si vous avez commencé une session."
                confirmText="Oui, revenir à l'accueil"
                cancelText="Annuler"
            />
        </div>
    );
};
