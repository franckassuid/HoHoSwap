import { useState } from 'react';
import { useWizard } from '../context/WizardContext';
import { matchSanta } from '../utils/santaLogic';
import emailjs from '@emailjs/browser';
import { AlertCircle, CheckCircle, EyeOff, Mail, RefreshCw, Send, Gift, Lock } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HoHoSwap - Secret Santa</title>
    <style>
        /* Reset et styles de base */
        body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f4; padding-bottom: 40px; }
        .main-container { background-color: #ffffff; margin: 0 auto; max-width: 600px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        
        /* Header */
        .header { display: flex; flex-direction: column; align-items: center; background-color: #dc2626; padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px; }
        .logo { height: 90px; width: 90px; margin-bottom: 10px; display: block; object-fit: contain; }

        /* Contenu */
        .content { padding: 40px 30px; color: #333333; text-align: center; }
        .greeting { font-size: 18px; margin-bottom: 30px; color: #555555; }
        
        /* La carte du résultat */
        .reveal-card { background-color: #fef2f2; border: 2px dashed #dc2626; border-radius: 12px; padding: 25px; margin: 20px 0; }
        .reveal-title { font-size: 14px; text-transform: uppercase; color: #dc2626; font-weight: bold; margin-bottom: 10px; letter-spacing: 1px; }
        .reveal-name { font-size: 32px; font-weight: bold; color: #1e293b; margin: 0; }

        /* Détails */
        .details { margin-top: 30px; text-align: left; background-color: #f8fafc; border-radius: 8px; padding: 20px; }
        .detail-item { font-size: 14px; margin-bottom: 10px; color: #475569; }
        .detail-item strong { color: #0f172a; }

        /* Message perso */
        .message-box { margin-top: 20px; font-style: italic; color: #64748b; font-size: 14px; border-left: 3px solid #cbd5e1; padding-left: 15px; text-align: left; }

        /* Footer */
        .footer { background-color: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 12px; }
        .footer a { color: #cbd5e1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="wrapper">
        <table class="main-container" align="center" border="0" cellpadding="0" cellspacing="0">
            <!-- HEADER -->
            <tr>
                <td class="header">
                    <img class="logo" src="https://raw.githubusercontent.com/franckassuid/HoHoSwap/refs/heads/main/public/logo.png" alt="HoHoSwap Logo">
                    <h1>HoHoSwap</h1>
                </td>
            </tr>

            <!-- CORPS -->
            <tr>
                <td class="content">
                    <p class="greeting">Bonjour <strong>{donneur}</strong> !</p>
                    
                    <p style="font-size: 16px; line-height: 1.5;">Le tirage au sort a été effectué.<br>Voici la personne à qui tu dois offrir un cadeau cette année :</p>

                    <!-- CARTE RESULTAT -->
                    <div class="reveal-card">
                        <div class="reveal-title">Ta cible est</div>
                        <h2 class="reveal-name">{cible}</h2>
                    </div>

                    <!-- DETAILS EVENT -->
                    <div class="details">
                        <div class="detail-item">📅 <strong>Date :</strong> {date}</div>
                        <div class="detail-item">💰 <strong>Budget Max :</strong> {prix}€</div>
                        
                        <!-- Message optionnel ajouté lors de l'envoi -->
                        <div class="message-box">
                            "Un petit message pour toi..."
                        </div>
                    </div>

                    <p style="margin-top: 30px; font-size: 14px; color: #888;">Garde le secret jusqu'au jour J ! 🤫</p>
                </td>
            </tr>

            <!-- FOOTER -->
            <tr>
                <td class="footer">
                    Généré avec ❤️ par HoHoSwap<br>
                    L'application de Secret Santa simple et gratuite.
                </td>
            </tr>
        </table>
    </div>
</body>
</html>`;

export const Step3_Draw = () => {
    const { participants, eventDetails, assignments, setAssignments, setStep, saveSession } = useWizard();

    const [error, setError] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [emailTemplate, setEmailTemplate] = useState(DEFAULT_TEMPLATE);
    const [sendingState, setSendingState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [progress, setProgress] = useState(0);

    // Derived state for preview
    const previewData = participants[0] ? {
        donneur: participants[0].name,
        cible: 'Destinataire Exemple',
        date: eventDetails.date ? format(new Date(eventDetails.date), 'dd/MM/yyyy') : '25/12/2024',
        prix: eventDetails.budget
    } : null;

    const handleDraw = () => {
        setError(null);
        const result = matchSanta(participants);
        if (result) {
            setAssignments(result);
            saveSession(); // Auto-save after a successful draw
        } else {
            setError("Impossible de trouver un tirage respectant les exclusions. Essayez d'assouplir les règles.");
        }
    };

    const handleSendEmails = async () => {
        // Check for keys
        const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (!serviceID || serviceID === 'your_service_id') {
            // Mock mode for demo if no keys
            setSendingState('sending');
            setTimeout(() => {
                setSendingState('success');
                alert("Mode démo : Les emails sont simulés (clés non configurées).");
            }, 2000);
            return;
        }

        setSendingState('sending');
        setProgress(0);
        let successCount = 0;

        const total = participants.length;

        for (let i = 0; i < total; i++) {
            const giver = participants[i];
            const receiverId = assignments[giver.id];
            const receiver = participants.find(p => p.id === receiverId);

            if (!receiver) continue;

            const templateParams = {
                donneur: giver.name,
                cible: receiver.name,
                date: eventDetails.date ? format(new Date(eventDetails.date), 'dd/MM/yyyy') : '',
                prix: eventDetails.budget,
                to_email: giver.email,
                message: emailTemplate
                    .replace('{donneur}', giver.name)
                    .replace('{cible}', receiver.name)
                    .replace('{date}', eventDetails.date ? format(new Date(eventDetails.date), 'dd/MM/yyyy') : '')
                    .replace('{prix}', eventDetails.budget)
            };

            try {
                await emailjs.send(serviceID, templateID, templateParams, publicKey);
                successCount++;
            } catch (err) {
                console.error(`Erreur d'envoi à ${giver.email}`, err);
            }

            setProgress(Math.round(((i + 1) / total) * 100));
        }

        if (successCount === total) {
            setSendingState('success');
        } else {
            setSendingState('error');
            setError(`Envoyé ${successCount}/${total} emails. Vérifiez la console.`);
        }
    };

    const hasResults = Object.keys(assignments).length > 0 && Object.keys(assignments).length === participants.length;

    const getPreviewText = () => {
        if (!previewData) return '';
        return emailTemplate
            .replace(/{donneur}/g, previewData.donneur)
            .replace(/{cible}/g, previewData.cible)
            .replace(/{date}/g, previewData.date)
            .replace(/{prix}/g, previewData.prix);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Action Zone */}
            <div className="text-center space-y-4">
                {!hasResults ? (
                    <div className="py-8">
                        <p className="text-slate-600 mb-6">Participants prêts : <span className="font-bold">{participants.length}</span>. Prêt à tirer au sort ?</p>
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={handleDraw}
                                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 animate-bounce-subtle"
                            >
                                <RefreshCw className="w-6 h-6" /> Lancer le Tirage
                            </button>
                            {error && (
                                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 max-w-md mx-auto border border-red-100">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-green-50 border border-green-200 p-6 rounded-xl flex flex-col items-center">
                        <CheckCircle className="w-12 h-12 text-green-600 mb-2" />
                        <h3 className="text-xl font-bold text-green-800">Tirage Réussi !</h3>
                        <p className="text-green-700">Chaque participant a reçu une cible secrète.</p>

                        {/* Admin Toggle */}
                        <div className="mt-6 w-full max-w-2xl bg-white/50 p-4 rounded-xl border border-green-100">
                            <button
                                onClick={() => setShowResults(!showResults)}
                                className="text-sm font-medium text-slate-600 flex items-center justify-center gap-2 hover:text-slate-900 mx-auto mb-2 transition-colors"
                            >
                                {showResults ? <EyeOff className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                {showResults ? 'Masquer les résultats (Admin)' : 'Voir les résultats (Zone Admin)'}
                            </button>

                            {showResults && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-in zoom-in-95 duration-200">
                                    {participants.map(p => {
                                        const target = participants.find(r => r.id === assignments[p.id]);
                                        return (
                                            <div key={p.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between group hover:border-red-200 transition-colors">
                                                <div className="flex flex-col text-left">
                                                    <span className="text-xs text-slate-400 font-medium uppercase">Offre à</span>
                                                    <span className="font-bold text-slate-800">{p.name}</span>
                                                </div>
                                                <Gift className="w-5 h-5 text-red-100 group-hover:text-red-500 transition-colors" />
                                                <div className="flex flex-col text-right">
                                                    <span className="text-xs text-slate-400 font-medium uppercase">Pour</span>
                                                    <span className="font-bold text-red-600">{target?.name}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {hasResults && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
                    {/* Template Editor */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2 text-slate-800">
                            <Mail className="w-5 h-5 text-red-600" /> Modèle d'email
                        </h3>
                        <div className="bg-slate-50 p-2 rounded text-xs text-slate-500 mb-2 space-x-2">
                            <span>Variables :</span>
                            <code className="bg-white px-1 rounded shadow-sm text-red-500">{'{donneur}'}</code>
                            <code className="bg-white px-1 rounded shadow-sm text-red-500">{'{cible}'}</code>
                            <code className="bg-white px-1 rounded shadow-sm text-red-500">{'{date}'}</code>
                            <code className="bg-white px-1 rounded shadow-sm text-red-500">{'{prix}'}</code>
                        </div>
                        <textarea
                            value={emailTemplate}
                            onChange={(e) => setEmailTemplate(e.target.value)}
                            className="w-full h-48 p-3 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-sm bg-white"
                        />
                    </div>

                    {/* Preview & Send */}
                    <div className="space-y-4 flex flex-col">
                        <h3 className="font-semibold text-slate-700">Aperçu du mail</h3>
                        <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                            {/* Mail Header Preview */}
                            <div className="bg-slate-50 border-b border-slate-100 p-3 text-xs text-slate-500 flex flex-col gap-1">
                                <div className="flex gap-2"><span className="font-bold text-slate-700">Objet :</span> Ton Secret Santa pour {eventDetails.name}</div>
                                <div className="flex gap-2"><span className="font-bold text-slate-700">De :</span> Père Noël via Secret Santa App</div>
                            </div>
                            {/* Mail Body */}
                            <div className="flex-1 min-h-[400px] relative bg-slate-50">
                                <iframe
                                    srcDoc={getPreviewText().replace('{{message}}', Object.values(assignments).length > 0 ? '' : 'Votre message personnel ici...')}
                                    className="w-full h-full absolute inset-0 border-0"
                                    title="Email Preview"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSendEmails}
                            disabled={sendingState === 'sending' || sendingState === 'success'}
                            className={clsx(
                                "w-full py-3 rounded-lg font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2",
                                sendingState === 'success' ? "bg-green-600" : "bg-red-600 hover:bg-red-700",
                                sendingState === 'sending' && "opacity-75 cursor-wait"
                            )}
                        >
                            {sendingState === 'idle' && <><Send className="w-5 h-5" /> Envoyer les emails</>}
                            {sendingState === 'sending' && <><RefreshCw className="w-5 h-5 animate-spin" /> Envoi en cours ({progress}%)...</>}
                            {sendingState === 'success' && <><CheckCircle className="w-5 h-5" /> Tout est envoyé !</>}
                            {sendingState === 'error' && <><AlertCircle className="w-5 h-5" /> Erreur (Réessayer)</>}
                        </button>
                    </div>
                </div>
            )}

            {/* Back Button */}
            {!hasResults && (
                <div className="flex justify-start">
                    <button onClick={() => setStep(2)} className="text-slate-500 hover:text-slate-800 underline flex items-center">
                        ← Retour aux exclusions
                    </button>
                </div>
            )}
        </div>
    );
};
