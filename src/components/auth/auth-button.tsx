/**
 * Enhanced Auth Button
 * Provides OAuth + Email/Password authentication with enhanced UI
 */

import { useEffect, useState } from 'react';
import { LogIn, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useAuth } from '../../contexts/auth-context';
import { LoginModal } from './login-modal';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	DropdownMenuGroup,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import {
	getAuthUserInitials,
	getAuthUserPrimaryLabel,
	getAuthUserSecondaryLabel,
} from '@/utils/auth-user';

interface AuthButtonProps {
	className?: string;
}

export function AuthButton({ className }: AuthButtonProps) {
	const {
		user,
		isAuthenticated,
		isLoading,
		error,
		login,
		logout,
		clearError,
	} = useAuth();

	const navigate = useNavigate();
	const [showLoginModal, setShowLoginModal] = useState(false);

	useEffect(() => {
		if (isAuthenticated) {
			setShowLoginModal(false);
		}
	}, [isAuthenticated]);

	if (isLoading) {
		return <Skeleton className="w-10 h-10 rounded-full" />;
	}

	if (!isAuthenticated || !user) {
		return (
			<>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setShowLoginModal(true)}
					className={clsx('gap-2', className)}
				>
					<LogIn className="h-4 w-4" />
					<span>Sign In</span>
				</Button>

				<LoginModal
					isOpen={showLoginModal}
					onClose={() => setShowLoginModal(false)}
					onLogin={async () => {
						await login();
					}}
					error={error}
					onClearError={clearError}
				/>
			</>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative rounded-full hover:ring-2 hover:ring-primary/20 transition-all"
				>
					<Avatar className="h-8 w-8">
						<AvatarImage
							src={user.avatarUrl}
							alt={getAuthUserPrimaryLabel(user)}
						/>
						<AvatarFallback className="bg-text-secondary/10 text-text-primary font-semibold">
							{getAuthUserInitials(user)}
						</AvatarFallback>
					</Avatar>
					{user.emailVerified && (
						<div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
					)}
				</Button>
			</DropdownMenuTrigger>

			<AnimatePresence>
				<DropdownMenuContent align="end" className="w-72" asChild>
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
					>
						<DropdownMenuLabel className="p-0">
							<div className="flex items-start gap-3 p-4">
								<Avatar className="h-12 w-12">
									<AvatarImage
										src={user.avatarUrl}
										alt={getAuthUserPrimaryLabel(user)}
									/>
									<AvatarFallback className="bg-text-secondary/10 text-text-primary font-semibold text-lg">
										{getAuthUserInitials(user)}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col gap-1 flex-1 text-text-primary">
									<div className="flex items-center gap-2">
										<span className="text-sm font-semibold">
											{getAuthUserPrimaryLabel(user)}
										</span>
									</div>
									<span className="text-xs text-text-tertiary">
										{getAuthUserSecondaryLabel(user)}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>

						<DropdownMenuGroup>
							<DropdownMenuItem
								onClick={() => navigate('/settings')}
								className="cursor-pointer"
							>
								<Settings className="mr-1 h-4 w-4" />
								Settings
							</DropdownMenuItem>
						</DropdownMenuGroup>

						<DropdownMenuItem
							onClick={() => logout()}
							className="cursor-pointer text-destructive focus:text-text-primary"
						>
							<LogOut className="mr-1 h-4 w-4" />
							Sign Out
						</DropdownMenuItem>
					</motion.div>
				</DropdownMenuContent>
			</AnimatePresence>
		</DropdownMenu>
	);
}
