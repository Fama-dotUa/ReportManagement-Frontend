import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 min
			gcTime: 30 * 60 * 1000, // 30 min
			refetchOnWindowFocus: false,
			retry: (failureCount: number, error: any) => {
				// Don't retry 401/403
				// @ts-ignore
				const status = error?.response?.status
				if (status === 401 || status === 403) return false
				return failureCount < 2
			},
		},
		mutations: {
			retry: 0,
		},
	},
})
