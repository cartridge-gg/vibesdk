import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, KeyRound } from 'lucide-react';
import { createPortal } from 'react-dom';

interface LoginModalProps {
	isOpen: boolean;
	onClose: () => void;
	onLogin: () => Promise<void> | void;
	error?: string | null;
	onClearError?: () => void;
	actionContext?: string;
	showCloseButton?: boolean;
}

export function LoginModal({
	isOpen,
	onClose,
	onLogin,
	error,
	onClearError,
	actionContext,
	showCloseButton = true,
}: LoginModalProps) {
	const [isLoading, setIsLoading] = useState(false);

	if (!isOpen) {
		return null;
	}

	const handleClose = () => {
		if (isLoading) {
			return;
		}

		onClearError?.();
		onClose();
	};

	const handleLogin = async () => {
		setIsLoading(true);
		try {
			await onLogin();
		} finally {
			setIsLoading(false);
		}
	};

	return createPortal(
		<AnimatePresence>
			<div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-4">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-black/50 backdrop-blur-md"
					onClick={handleClose}
				/>

				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 20 }}
					transition={{ type: 'spring', duration: 0.5 }}
					className="relative z-10 mx-auto my-8 w-full max-w-md"
				>
					<div className="overflow-hidden rounded-2xl border border-border-primary/50 bg-bg-3/95 text-text-primary shadow-2xl backdrop-blur-xl">
						<div className="relative p-6">
							{showCloseButton && (
								<button
									onClick={handleClose}
									className="absolute right-4 top-4 rounded-lg p-2 transition-colors hover:bg-accent"
								>
									<X className="h-4 w-4" />
								</button>
							)}

							<div className="space-y-2 text-center">
								<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-text-secondary/10">
									<KeyRound className="h-6 w-6 text-text-primary" />
								</div>
								<h2 className="text-2xl font-semibold">
									{actionContext ? `Sign in ${actionContext}` : 'Sign in with Cartridge'}
								</h2>
								<p className="text-text-tertiary">
									Use Cartridge Controller to authenticate and start prompting immediately.
								</p>
							</div>
						</div>

						{error && (
							<div className="mx-6 rounded-lg border border-destructive/20 bg-destructive/10 p-3">
								<div className="flex items-start gap-2">
									<AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
									<p className="text-sm text-destructive">{error}</p>
								</div>
							</div>
						)}

						<div className="space-y-4 p-6 pt-5">
							<button
								onClick={() => {
									void handleLogin();
								}}
								disabled={isLoading}
								className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#f48120]/30 bg-[#161514] px-4 py-4 text-white transition-all hover:border-[#f48120]/60 hover:bg-[#201d1a] disabled:cursor-not-allowed disabled:opacity-50"
							>
								<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f48120] font-semibold text-white">
									C
								</div>
								<div className="flex flex-col items-start text-left">
									<span className="font-medium">Continue with Cartridge Controller</span>
									<span className="text-xs text-white/70">
										Passkey-based sign in with a Starknet account
									</span>
								</div>
							</button>

							<p className="text-center text-xs text-text-tertiary">
								GitHub and Google login are disabled for this app.
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</AnimatePresence>,
		document.body,
	);
}
