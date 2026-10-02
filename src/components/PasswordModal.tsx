import React, { useState } from 'react';
import { Lock, ShieldCheck, Key } from 'lucide-react';
import { Modal } from '../design-system/Modal';
import { Input } from '../design-system/Input';
import { Button } from '../design-system/Button';
import { academicService } from '../services/academicService';

export interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Confidential Results Access',
  description = 'To view or download your official SGPA/CGPA transcript grade card, please verify your student security password.',
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await academicService.verifyResultsPassword(password);
    setIsLoading(false);

    if (res.success) {
      setPassword('');
      onSuccess();
    } else {
      setError(res.error || 'Invalid security password.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-indigo-600" />
          <span>{title}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <p className="text-xs text-slate-600 mb-4">{description}</p>

        <Input
          label="Student Portal Security Password"
          type="password"
          placeholder="Enter password (e.g. student123)"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
          leftIcon={<Key size={16} />}
          error={error || undefined}
          autoFocus
        />

        <div className="text-xs text-slate-500 mb-6 bg-slate-50 p-3 rounded-md border border-slate-200 flex items-start gap-2">
          <Lock size={14} className="text-slate-400 shrink-0 mt-0.5" />
          <span>This verification check is validated directly with the backend security service. No passwords are stored locally in the browser.</span>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Verify & Unlock
          </Button>
        </div>
      </form>
    </Modal>
  );
};
