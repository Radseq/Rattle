import { api } from "~/utils/api"

export const useGetTrends = () => {
	const profile = api.search.getLastTrends.useQuery()
	return profile.data || []
}
