import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Types
export interface Participant {
    id: string;
    name: string;
    email: string;
    exclusions: string[]; // List of IDs they cannot gift to
}

export interface EventDetails {
    name: string;
    date: string;
    budget: string;
}

export interface SavedSession {
    id: string; // Unique ID for the session
    lastUpdated: number; // Timestamp
    eventDetails: EventDetails;
    participants: Participant[];
    assignments: Record<string, string>;
    step: number;
}

interface WizardState extends Omit<SavedSession, 'id' | 'lastUpdated'> {
    sessionId: string | null; // Current active session ID
}

interface WizardContextType extends WizardState {
    savedSessions: SavedSession[];
    setStep: (step: number) => void;
    updateEventDetails: (details: Partial<EventDetails>) => void;
    addParticipant: (participant: Omit<Participant, 'id' | 'exclusions'>) => void;
    removeParticipant: (id: string) => void;
    toggleExclusion: (giverId: string, receiverId: string) => void;
    setAssignments: (assignments: Record<string, string>) => void;

    // Session Management
    startNewSession: () => void;
    saveSession: () => void;
    loadSession: (id: string) => void;
    deleteSession: (id: string) => void;
}

const CURRENT_STATE_KEY = 'secret-santa-current';
const HISTORY_KEY = 'secret-santa-history';

const defaultState: WizardState = {
    sessionId: null,
    step: 1,
    eventDetails: {
        name: '',
        date: '',
        budget: '',
    },
    participants: [],
    assignments: {},
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const WizardProvider = ({ children }: { children: ReactNode }) => {
    // Current active state
    const [state, setState] = useState<WizardState>(() => {
        const saved = localStorage.getItem(CURRENT_STATE_KEY);
        return saved ? JSON.parse(saved) : defaultState;
    });

    // History of saved sessions
    const [savedSessions, setSavedSessions] = useState<SavedSession[]>(() => {
        const saved = localStorage.getItem(HISTORY_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    // Persist current state
    useEffect(() => {
        localStorage.setItem(CURRENT_STATE_KEY, JSON.stringify(state));
    }, [state]);

    // Persist history
    useEffect(() => {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(savedSessions));
    }, [savedSessions]);

    const setStep = (step: number) => setState(prev => ({ ...prev, step }));

    const updateEventDetails = (details: Partial<EventDetails>) => {
        setState(prev => ({
            ...prev,
            eventDetails: { ...prev.eventDetails, ...details }
        }));
    };

    const addParticipant = (data: Omit<Participant, 'id' | 'exclusions'>) => {
        const newParticipant: Participant = {
            id: crypto.randomUUID(),
            ...data,
            exclusions: [],
        };
        setState(prev => ({
            ...prev,
            participants: [...prev.participants, newParticipant]
        }));
    };

    const removeParticipant = (id: string) => {
        setState(prev => ({
            ...prev,
            participants: prev.participants.filter(p => p.id !== id),
            assignments: {},
        }));
    };

    const toggleExclusion = (giverId: string, receiverId: string) => {
        setState(prev => {
            const giver = prev.participants.find(p => p.id === giverId);
            if (!giver) return prev;

            const isExcluded = giver.exclusions.includes(receiverId);
            const newExclusions = isExcluded
                ? giver.exclusions.filter(id => id !== receiverId)
                : [...giver.exclusions, receiverId];

            return {
                ...prev,
                participants: prev.participants.map(p =>
                    p.id === giverId ? { ...p, exclusions: newExclusions } : p
                )
            };
        });
    };

    const setAssignments = (assignments: Record<string, string>) => {
        setState(prev => ({ ...prev, assignments }));
    };

    // --- Session Management ---

    const generateId = () => crypto.randomUUID();

    const startNewSession = () => {
        setState({
            ...defaultState,
            sessionId: generateId(),
            // Default date to current year christmas as requested
            eventDetails: {
                ...defaultState.eventDetails,
                date: `${new Date().getFullYear()}-12-25`
            }
        });
    };

    const saveSession = () => {
        // If no ID, create one
        let currentId = state.sessionId;
        if (!currentId) {
            currentId = generateId();
            setState(prev => ({ ...prev, sessionId: currentId }));
        }

        const sessionData: SavedSession = {
            id: currentId!,
            lastUpdated: Date.now(),
            eventDetails: state.eventDetails,
            participants: state.participants,
            assignments: state.assignments,
            step: state.step
        };

        setSavedSessions(prev => {
            const existingIndex = prev.findIndex(s => s.id === currentId);
            if (existingIndex >= 0) {
                const newHistory = [...prev];
                newHistory[existingIndex] = sessionData;
                return newHistory;
            }
            return [sessionData, ...prev];
        });
    };

    const loadSession = (id: string) => {
        const session = savedSessions.find(s => s.id === id);
        if (session) {
            setState({
                sessionId: session.id,
                step: session.step,
                eventDetails: session.eventDetails,
                participants: session.participants,
                assignments: session.assignments
            });
        }
    };

    const deleteSession = (id: string) => {
        setSavedSessions(prev => prev.filter(s => s.id !== id));
        if (state.sessionId === id) {
            startNewSession();
        }
    };

    // Auto-save on specific changes (optional, or just manual "Save for later"?)
    // Request asks to "garde en mémoire les derniers tirages".
    // We can auto-save to history whenever we leave a step or complete a crucial action.
    // simpler: Auto-save to history on Step Change or Draw.
    useEffect(() => {
        if (state.participants.length > 0 && state.sessionId) {
            // Very basic debounce or check could go here, but for now we just 
            // update the history entry matching this ID whenever state changes significantly
            // Actually, let's keep it simple: We save to history only when explicitly asked 
            // OR we can just rely on `saveSession` being called at key moments.
            // But the user wants "resume later". The current state is already in localStorage.
            // The History is for *switching* between events.
            // Let's auto-update the History entry if it exists.
            setSavedSessions(prev => {
                const idx = prev.findIndex(s => s.id === state.sessionId);
                if (idx === -1) return prev; // Don't auto-create in history, only update if already there

                const updated = [...prev];
                updated[idx] = {
                    id: state.sessionId!,
                    lastUpdated: Date.now(),
                    eventDetails: state.eventDetails,
                    participants: state.participants,
                    assignments: state.assignments,
                    step: state.step
                };
                return updated;
            });
        }
    }, [state.step, state.assignments, state.eventDetails, state.participants]); // Update history on these changes

    // Initialize session ID if null on mount (legacy support or fresh start)
    useEffect(() => {
        if (!state.sessionId) {
            // Check if it looks like an active legacy session
            if (state.participants.length > 0) {
                const newId = generateId();
                setState(prev => ({ ...prev, sessionId: newId }));
                // Also add to history immediately so it's not lost
                setSavedSessions(prev => [{
                    id: newId,
                    lastUpdated: Date.now(),
                    eventDetails: state.eventDetails,
                    participants: state.participants,
                    assignments: state.assignments,
                    step: state.step
                }, ...prev]);
            } else {
                // Empty state, set defaults
                setState(prev => ({
                    ...prev,
                    eventDetails: {
                        ...prev.eventDetails,
                        date: `${new Date().getFullYear()}-12-25`
                    }
                }));
            }
        }
    }, []);

    return (
        <WizardContext.Provider value={{
            ...state,
            savedSessions,
            setStep,
            updateEventDetails,
            addParticipant,
            removeParticipant,
            toggleExclusion,
            setAssignments,
            startNewSession,
            saveSession,
            loadSession,
            deleteSession
        }}>
            {children}
        </WizardContext.Provider>
    );
};

export const useWizard = () => {
    const context = useContext(WizardContext);
    if (context === undefined) {
        throw new Error('useWizard must be used within a WizardProvider');
    }
    return context;
};
