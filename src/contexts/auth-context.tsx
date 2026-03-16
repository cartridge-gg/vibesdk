import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { useNavigate } from 'react-router';
import { useAccount, useConnect, useDisconnect } from '@starknet-react/core';
import { num } from 'starknet';
import type { TypedData } from 'starknet';
import { apiClient, ApiError } from '@/lib/api-client';
import { useSentryUser } from '@/hooks/useSentryUser';
import type { AuthSession, AuthUser } from '../api-types';
import {
	controllerConnector,
	decodeControllerChainId,
	type ControllerChainId,
} from './starknet-provider';

interface AuthContextType {
	user: AuthUser | null;
	token: string | null;
	session: AuthSession | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	authProviders: {
		controller: boolean;
	} | null;
	login: (redirectUrl?: string) => Promise<void>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
	clearError: () => void;
	setIntendedUrl: (url: string) => void;
	getIntendedUrl: () => string | null;
	clearIntendedUrl: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_REFRESH_INTERVAL = 60 * 60 * 1000;
const INTENDED_URL_KEY = 'auth_intended_url';

function getErrorMessage(error: unknown): string {
	if (error instanceof ApiError) {
		return error.message;
	}

	if (error instanceof Error && error.message) {
		return error.message;
	}

	return 'Connection error. Please try again.';
}

function normalizeSignatureValue(value: string | bigint): string {
	if (typeof value === 'bigint') {
		return num.toHex(value);
	}

	return value;
}

function normalizeControllerSignature(signature: unknown): string[] {
	if (Array.isArray(signature)) {
		return signature.map((value) =>
			normalizeSignatureValue(value as string | bigint),
		);
	}

	if (
		signature &&
		typeof signature === 'object' &&
		'r' in signature &&
		's' in signature
	) {
		const formattedSignature = signature as {
			r: string | bigint;
			s: string | bigint;
		};

		return [
			normalizeSignatureValue(formattedSignature.r),
			normalizeSignatureValue(formattedSignature.s),
		];
	}

	throw new Error('Unsupported Starknet signature format');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [session, setSession] = useState<AuthSession | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [authProviders, setAuthProviders] = useState<{
		controller: boolean;
	} | null>(null);
	const [hasInitialized, setHasInitialized] = useState(false);
	const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
	const controllerLoginInFlightRef = useRef(false);
	const navigate = useNavigate();
	const { connectAsync } = useConnect();
	const { disconnectAsync } = useDisconnect();
	const { account, address, chainId, isConnected } = useAccount();
	const isAuthenticated = !!user;

	useSentryUser(user);

	const setAuthenticatedState = useCallback(
		(authUser: AuthUser, sessionId: string, expiresAt?: Date | string | null) => {
			setUser({ ...authUser, isAnonymous: false } as AuthUser);
			setToken(null);
			setSession({
				userId: authUser.id,
				email: authUser.email,
				sessionId,
				expiresAt: expiresAt ? new Date(expiresAt) : null,
			});
		},
		[],
	);

	const clearAuthState = useCallback(() => {
		setUser(null);
		setToken(null);
		setSession(null);
	}, []);

	const setIntendedUrl = useCallback((url: string) => {
		try {
			sessionStorage.setItem(INTENDED_URL_KEY, url);
		} catch (storageError) {
			console.warn('Failed to store intended URL:', storageError);
		}
	}, []);

	const getIntendedUrl = useCallback((): string | null => {
		try {
			return sessionStorage.getItem(INTENDED_URL_KEY);
		} catch (storageError) {
			console.warn('Failed to retrieve intended URL:', storageError);
			return null;
		}
	}, []);

	const clearIntendedUrl = useCallback(() => {
		try {
			sessionStorage.removeItem(INTENDED_URL_KEY);
		} catch (storageError) {
			console.warn('Failed to clear intended URL:', storageError);
		}
	}, []);

	const setupTokenRefresh = useCallback(() => {
		if (refreshTimerRef.current) {
			clearInterval(refreshTimerRef.current);
		}

		refreshTimerRef.current = setInterval(async () => {
			try {
				const response = await apiClient.getProfile(true);
				if (!response.success || !response.data?.user) {
					clearAuthState();
					if (refreshTimerRef.current) {
						clearInterval(refreshTimerRef.current);
					}
					return;
				}

				setAuthenticatedState(
					{ ...response.data.user, isAnonymous: false } as AuthUser,
					response.data.sessionId,
				);
			} catch (refreshError) {
				console.error('Session validation failed:', refreshError);
			}
		}, TOKEN_REFRESH_INTERVAL);
	}, [clearAuthState, setAuthenticatedState]);

	const fetchAuthProviders = useCallback(async () => {
		try {
			const response = await apiClient.getAuthProviders();
			if (response.success && response.data) {
				setAuthProviders({
					controller: response.data.providers.controller,
				});
			}
		} catch (providerError) {
			console.warn('Failed to fetch auth providers:', providerError);
			setAuthProviders({ controller: true });
		}
	}, []);

	const checkAuth = useCallback(async () => {
		try {
			const response = await apiClient.getProfile(true);

			if (response.success && response.data?.user) {
				setAuthenticatedState(
					{ ...response.data.user, isAnonymous: false } as AuthUser,
					response.data.sessionId,
				);
				setupTokenRefresh();
			} else {
				clearAuthState();
			}
		} catch (authError) {
			console.error('Auth check failed:', authError);
			clearAuthState();
		} finally {
			setIsLoading(false);
			setHasInitialized(true);
		}
	}, [clearAuthState, setAuthenticatedState, setupTokenRefresh]);

	useEffect(() => {
		return () => {
			if (refreshTimerRef.current) {
				clearInterval(refreshTimerRef.current);
			}
		};
	}, []);

	useEffect(() => {
		const initializeAuth = async () => {
			await fetchAuthProviders();
			await checkAuth();
		};

		void initializeAuth();
	}, [fetchAuthProviders, checkAuth]);

	const login = useCallback(
		async (redirectUrl?: string) => {
			setError(null);
			setIsLoading(true);
			setIntendedUrl(
				redirectUrl || window.location.pathname + window.location.search,
			);

			try {
				await connectAsync({ connector: controllerConnector });
			} catch (connectError) {
				setError(getErrorMessage(connectError));
				setIsLoading(false);
				throw connectError;
			}
		},
		[connectAsync, setIntendedUrl],
	);

	const refreshUser = useCallback(async () => {
		try {
			const response = await apiClient.getProfile(true);
			if (response.success && response.data?.user) {
				setAuthenticatedState(
					{ ...response.data.user, isAnonymous: false } as AuthUser,
					response.data.sessionId,
				);
			}
		} catch (refreshError) {
			console.error('Refresh user failed:', refreshError);
		}
	}, [setAuthenticatedState]);

	const logout = useCallback(async () => {
		try {
			await apiClient.logout();
		} catch (logoutError) {
			console.error('Logout error:', logoutError);
		} finally {
			try {
				await disconnectAsync();
			} catch (disconnectError) {
				console.error('Controller disconnect error:', disconnectError);
			}

			clearAuthState();
			clearIntendedUrl();
			setError(null);
			setIsLoading(false);
			navigate('/');
		}
	}, [clearAuthState, clearIntendedUrl, disconnectAsync, navigate]);

	useEffect(() => {
		if (
			!hasInitialized ||
			isAuthenticated ||
			!isConnected ||
			!address ||
			!account ||
			!chainId ||
			controllerLoginInFlightRef.current
		) {
			return;
		}

		const normalizedChainId = decodeControllerChainId(chainId);
		if (!normalizedChainId) {
			setError('Unsupported Starknet chain for Cartridge Controller login.');
			return;
		}

		controllerLoginInFlightRef.current = true;
		setError(null);
		setIsLoading(true);

		const loginWithController = async (controllerChainId: ControllerChainId) => {
			try {
				const challengeResponse = await apiClient.getControllerChallenge({
					address,
					chainId: controllerChainId,
				});
				const challengeData = challengeResponse.data;
				if (!challengeData) {
					throw new Error('Controller challenge response was empty');
				}

				const typedData = challengeData.typedData as TypedData;
				const signature = await account.signMessage(typedData);
				const username = await Promise.resolve(controllerConnector.username());
				const response = await apiClient.loginWithController({
					address,
					chainId: controllerChainId,
					challengeToken: challengeData.challengeToken,
					signature: normalizeControllerSignature(signature),
					username: typeof username === 'string' ? username : undefined,
				});

				if (!response.success || !response.data) {
					throw new Error('Controller login failed');
				}

				setAuthenticatedState(
					{ ...response.data.user, isAnonymous: false } as AuthUser,
					response.data.sessionId,
					response.data.expiresAt,
				);
				setupTokenRefresh();
				await apiClient.refreshCsrfToken();

				const intendedUrl = getIntendedUrl();
				clearIntendedUrl();
				navigate(intendedUrl || '/');
			} catch (controllerError) {
				setError(getErrorMessage(controllerError));
				clearAuthState();

				try {
					await disconnectAsync();
				} catch (disconnectError) {
					console.error('Controller disconnect after failed login:', disconnectError);
				}
			} finally {
				controllerLoginInFlightRef.current = false;
				setIsLoading(false);
			}
		};

		void loginWithController(normalizedChainId);
	}, [
		account,
		address,
		chainId,
		clearAuthState,
		clearIntendedUrl,
		disconnectAsync,
		getIntendedUrl,
		hasInitialized,
		isAuthenticated,
		isConnected,
		navigate,
		setAuthenticatedState,
		setupTokenRefresh,
	]);

	const clearError = useCallback(() => setError(null), []);

	const value: AuthContextType = {
		user,
		token,
		session,
		isAuthenticated: !!user,
		isLoading,
		error,
		authProviders,
		login,
		logout,
		refreshUser,
		clearError,
		setIntendedUrl,
		getIntendedUrl,
		clearIntendedUrl,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
