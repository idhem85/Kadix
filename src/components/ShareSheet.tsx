import { useState } from 'react';
import { Share2, Copy, Check, QrCode, Users, X } from 'lucide-react';
import { useGroceryStore } from '../store/groceryStore';

interface ShareSheetProps {
  onClose: () => void;
}

export default function ShareSheet({ onClose }: ShareSheetProps) {
  const { currentList } = useGroceryStore();
  const [copied, setCopied] = useState(false);

  const inviteCode = currentList?.invite_code || 'ABCDEF';
  const inviteLink = `${window.location.origin}/join/${inviteCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Kadix - Liste de courses',
          text: 'Rejoins ma liste de courses Kadix !',
          url: inviteLink,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-sage-600" />
            <h2 className="text-lg font-semibold text-sage-800">
              Partager la liste
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-sage-500 hover:bg-sage-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Invite code */}
        <div className="bg-sage-50 rounded-2xl p-4 mb-4">
          <p className="text-xs text-sage-500 font-medium mb-2">
            Code d'invitation
          </p>
          <div className="flex items-center justify-center gap-3">
            {inviteCode.split('').map((char, i) => (
              <span
                key={i}
                className="w-10 h-12 bg-white rounded-xl border border-sage-200 flex items-center justify-center text-lg font-bold text-sage-700"
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-sage-200 hover:border-sage-300 hover:bg-sage-50 rounded-2xl transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center group-hover:bg-sage-200 transition-colors">
              {copied ? (
                <Check size={20} className="text-green-600" />
              ) : (
                <Copy size={20} className="text-sage-600" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-sage-800">
                {copied ? 'Lien copié !' : 'Copier le lien d\'invitation'}
              </p>
              <p className="text-[11px] text-sage-400">
                {inviteLink}
              </p>
            </div>
          </button>

          <button
            onClick={handleShare}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-sage-200 hover:border-sage-300 hover:bg-sage-50 rounded-2xl transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center group-hover:bg-sage-200 transition-colors">
              <Share2 size={20} className="text-sage-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-sage-800">
                Partager via...
              </p>
              <p className="text-[11px] text-sage-400">
                WhatsApp, Messages, Email, etc.
              </p>
            </div>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-sage-200 hover:border-sage-300 hover:bg-sage-50 rounded-2xl transition-all group">
            <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center group-hover:bg-sage-200 transition-colors">
              <QrCode size={20} className="text-sage-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-sage-800">
                Afficher le QR Code
              </p>
              <p className="text-[11px] text-sage-400">
                Scannez pour rejoindre la liste
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
