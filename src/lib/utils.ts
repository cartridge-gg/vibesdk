import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getPreviewUrl(previewURL?: string, tunnelURL?: string): string {
	return tunnelURL || previewURL || '';
}

export function capitalizeFirstLetter(str: string) {
	if (typeof str !== 'string' || str.length === 0) {
		return str;
	}
	return str.charAt(0).toUpperCase() + str.slice(1);
}
