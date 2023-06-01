const THOUSAND = 1000
const THOUSAND_FORMAT_THRESHOLD = 10

export const useNumberFormatter = (input: number): string => {
	const inputInThousand = input / THOUSAND
	if (inputInThousand > THOUSAND_FORMAT_THRESHOLD) {
		return `${(input / THOUSAND).toFixed(2)}K`
	}
	return input.toString()
}
