import { useWizard } from '../context/WizardContext';
import { Ban, Info } from 'lucide-react';
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
                    <p className="font-semibold mb-1">Comment lire ce tableau :</p>
                    <p>Lignes = <strong>Donneurs</strong> (Offrent), Colonnes = <strong>Receveurs</strong> (Reçoivent).</p>
                    <p>Cochez une case pour <span className="font-bold text-red-600">INTERDIRE</span> une association.</p>
                    <p className="mt-1 text-xs text-blue-600">S'offrir à soi-même est impossible par défaut.</p>
                </div>
            </div>

            <div className="overflow-x-auto pb-4">
                <table className="w-full min-w-[500px] border-collapse">
                    <thead>
                        <tr>
                            <th className="p-3 bg-slate-100 border border-slate-200 text-left min-w-[150px] sticky left-0 z-10">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">De \ À</span>
                            </th>
                            {participants.map(p => (
                                <th key={p.id} className="p-3 bg-slate-50 border border-slate-200 text-center min-w-[100px]">
                                    <span className="text-sm font-semibold text-slate-700 block truncate w-24 mx-auto" title={p.name}>
                                        {p.name}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {participants.map(giver => (
                            <tr key={giver.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 bg-white border border-slate-200 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    <span className="font-medium text-slate-800">{giver.name}</span>
                                </td>
                                {participants.map(receiver => {
                                    const isSelf = giver.id === receiver.id;
                                    const isExcluded = giver.exclusions.includes(receiver.id);

                                    return (
                                        <td key={`${giver.id}-${receiver.id}`} className="p-3 border border-slate-200 text-center">
                                            <div className="flex justify-center">
                                                {isSelf ? (
                                                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center cursor-not-allowed">
                                                        <Ban className="w-4 h-4 text-slate-300" />
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => toggleExclusion(giver.id, receiver.id)}
                                                        className={clsx(
                                                            "w-8 h-8 rounded transition-all duration-200 flex items-center justify-center border-2",
                                                            isExcluded
                                                                ? "bg-red-600 border-red-600 text-white"
                                                                : "bg-white border-slate-200 text-transparent hover:border-red-300"
                                                        )}
                                                        title={isExcluded ? `Bloqué : ${giver.name} -> ${receiver.name}` : `Bloquer : ${giver.name} -> ${receiver.name}`}
                                                    >
                                                        <Ban className={clsx("w-4 h-4", isExcluded ? "opacity-100" : "opacity-0")} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
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
