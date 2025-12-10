import { useWizard } from '../context/WizardContext';
import { Ban, Info, User } from 'lucide-react';
import clsx from 'clsx';

export const Step2_Exclusions = () => {
    const { participants, toggleExclusion, setStep } = useWizard();

    // If we don't have enough participants (shouldn't happen due to Step 1 checks, but safety first)
    if (participants.length < 3) {
        return (
            <div className="text-center p-8">
                <p className="text-red-500 mb-4">Pas assez de participants définis.</p>
                <button onClick={() => setStep(1)} className="text-blue-600 underline">Retourner à la configuration</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 border border-blue-100">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Définissez les incompatibilités</p>
                    <p>Pour chaque personne, cliquez sur les noms que vous souhaitez <strong>exclure</strong> (par exemple époux/épouse).</p>
                    <p className="mt-1 text-xs text-blue-600">Note : S'offrir à soi-même est déjà impossible.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {participants.map(giver => (
                    <div key={giver.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">{giver.name}</h3>
                                <p className="text-xs text-slate-500">Ne doit pas offrir à...</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {participants.filter(p => p.id !== giver.id).map(receiver => {
                                const isExcluded = giver.exclusions.includes(receiver.id);
                                return (
                                    <button
                                        key={receiver.id}
                                        onClick={() => toggleExclusion(giver.id, receiver.id)}
                                        className={clsx(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                                            isExcluded
                                                ? "bg-red-50 border-red-200 text-red-700 shadow-sm"
                                                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300"
                                        )}
                                        title={isExcluded ? `Autoriser ${receiver.name}` : `Interdire ${receiver.name}`}
                                    >
                                        {isExcluded ? <Ban size={12} /> : null}
                                        {receiver.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between pt-6 border-t border-gray-100 mt-8">
                <button
                    onClick={() => setStep(1)}
                    className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    Retour
                </button>
                <button
                    onClick={() => setStep(3)}
                    className="px-6 py-2.5 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                    Suivant : Tirage
                </button>
            </div>
        </div>
    );
};
