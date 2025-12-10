import { useState } from 'react';
import { useWizard } from '../context/WizardContext';
import { Calendar, Euro, Plus, Trash2, Users, History, PlayCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const Step1_Setup = () => {
    const {
        eventDetails,
        updateEventDetails,
        participants,
        addParticipant,
        removeParticipant,
        setStep,
        savedSessions,
        loadSession,
        deleteSession,
        startNewSession,
        sessionId
    } = useWizard();

    const [newPartName, setNewPartName] = useState('');
    const [newPartEmail, setNewPartEmail] = useState('');
    const [error, setError] = useState('');

    const handleAddParticipant = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPartName.trim() || !newPartEmail.trim()) {
            setError('Veuillez remplir le nom et l\'email.');
            return;
        }
        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newPartEmail)) {
            setError('Veuillez entrer une adresse email valide.');
            return;
        }

        addParticipant({ name: newPartName, email: newPartEmail });
        setNewPartName('');
        setNewPartEmail('');
        setError('');
    };

    const handleNewSession = () => {
        if (confirm("Voulez-vous vraiment commencer un nouveau tirage ? L'actuel sera sauvegardé dans l'historique.")) {
            startNewSession();
        }
    };

    const canProceed = participants.length >= 3 &&
        eventDetails.name &&
        eventDetails.date &&
        eventDetails.budget;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Session History (Dashboard) */}
            {savedSessions.length > 0 && (
                <div className="bg-slate-100 p-4 rounded-lg mb-8 border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-600 flex items-center mb-3">
                        <History className="w-4 h-4 mr-2" /> Vos derniers événements
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {savedSessions.map(session => (
                            <div key={session.id} className={`flex items-center justify-between p-3 rounded-md bg-white border ${session.id === sessionId ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'}`}>
                                <div className="flex-1 min-w-0 mr-4">
                                    <p className="text-sm font-semibold truncate text-slate-800">{session.eventDetails.name || 'Événement sans nom'}</p>
                                    <p className="text-xs text-slate-500">
                                        {session.participants.length} participants • Modifié {formatDistanceToNow(session.lastUpdated, { addSuffix: true, locale: fr })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {session.id !== sessionId ? (
                                        <button
                                            onClick={() => loadSession(session.id)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                            title="Reprendre"
                                        >
                                            <PlayCircle className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <span className="text-xs text-red-600 font-medium px-2">En cours</span>
                                    )}
                                    <button
                                        onClick={() => deleteSession(session.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                        title="Supprimer"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleNewSession}
                        className="mt-3 text-xs text-blue-600 hover:underline flex items-center"
                    >
                        <Plus className="w-3 h-3 mr-1" /> Commencer un nouveau Secret Santa
                    </button>
                </div>
            )}

            {/* Section 1: Event Details */}
            <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-red-600" />
                    Détails de l'événement
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'événement</label>
                        <input
                            type="text"
                            value={eventDetails.name}
                            onChange={(e) => updateEventDetails({ name: e.target.value })}
                            placeholder="Ex: Noël en Famille 2025"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={eventDetails.date}
                            onChange={(e) => updateEventDetails({ date: e.target.value })}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Budget Max</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={eventDetails.budget}
                                onChange={(e) => updateEventDetails({ budget: e.target.value })}
                                placeholder="50"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border pl-8"
                            />
                            <Euro className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                        </div>
                    </div>
                </div>
            </section>

            <hr className="border-gray-100" />

            {/* Section 2: Participants */}
            <section>
                <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-red-600" />
                    Participants ({participants.length})
                </h2>

                {/* Add Form */}
                <form onSubmit={handleAddParticipant} className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Nom</label>
                            <input
                                type="text"
                                value={newPartName}
                                onChange={(e) => setNewPartName(e.target.value)}
                                placeholder="Jean Dupont"
                                className="w-full text-sm rounded-md border-gray-300 focus:ring-red-500 focus:border-red-500 p-2 border"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                            <input
                                type="email"
                                value={newPartEmail}
                                onChange={(e) => setNewPartEmail(e.target.value)}
                                placeholder="jean@exemple.com"
                                className="w-full text-sm rounded-md border-gray-300 focus:ring-red-500 focus:border-red-500 p-2 border"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center bg-slate-800 hover:bg-slate-900 text-white p-2 rounded-md text-sm transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-1" /> Ajouter
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
                </form>

                {/* List */}
                {participants.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        Aucun participant pour le moment.
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm divide-y divide-gray-100">
                        {participants.map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-800">{p.name}</span>
                                    <span className="text-xs text-slate-500">{p.email}</span>
                                </div>
                                <button
                                    onClick={() => removeParticipant(p.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title="Supprimer"
                                    aria-label="Supprimer le participant"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <div className="flex justify-end pt-4">
                <button
                    onClick={() => setStep(2)}
                    disabled={!canProceed}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${canProceed
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl translate-y-0'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    Étape Suivante : Exclusions
                </button>
                {!canProceed && participants.length < 3 && (
                    <p className="text-xs text-red-500 mt-2 ml-4 self-center">
                        Minimum 3 participants requis.
                    </p>
                )}
            </div>
        </div>
    );
};
