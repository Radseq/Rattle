import { type Profile } from "~/features/profile"
import { api } from "~/utils/api"

const MAX_SEARCHED_PEOPLES = 3

export const useGetPeoples = (tag: string) => {
	const { data, isLoading: peoplesLoading } = api.search.getAllUsersByTag.useQuery({
		limit: MAX_SEARCHED_PEOPLES,
		tag,
	})

	const peoples: Profile[] = data || []

	return { peoples, peoplesLoading }
}
