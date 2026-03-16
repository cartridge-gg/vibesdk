import type { AuthUser } from '@/api-types';

export function formatWalletAddress(address: string): string {
	if (address.length <= 12) {
		return address;
	}

	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getAuthProviderLabel(provider?: string): string {
	if (provider === 'controller') {
		return 'Cartridge Controller';
	}

	if (!provider) {
		return 'Unknown';
	}

	return provider.charAt(0).toUpperCase() + provider.slice(1);
}

export function getAuthUserPrimaryLabel(user: AuthUser | null): string {
	if (!user) {
		return 'User';
	}

	if (user.displayName) {
		return user.displayName;
	}

	if (user.walletAddress) {
		return formatWalletAddress(user.walletAddress);
	}

	return user.email;
}

export function getAuthUserSecondaryLabel(user: AuthUser | null): string {
	if (!user) {
		return '';
	}

	return user.walletAddress || user.email;
}

export function getAuthUserInitials(user: AuthUser | null): string {
	const primaryLabel = getAuthUserPrimaryLabel(user).trim();
	if (!primaryLabel) {
		return '?';
	}

	if (primaryLabel.includes(' ')) {
		return primaryLabel
			.split(' ')
			.map((part) => part[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	return primaryLabel.slice(0, 2).toUpperCase();
}
