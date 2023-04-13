import { type typeToFlattenedError } from "zod"

export const ParseZodErrorToString = (
	zodError: typeToFlattenedError<any, string> | null | undefined
) => {
	const errors: string[] = []
	if (zodError?.fieldErrors) {
		const zodErrors = Object.entries(zodError.fieldErrors).map(([key, value]) => ({
			key,
			value,
		}))

		for (const keyValues of zodErrors) {
			if (keyValues.value) {
				errors.push(keyValues.value?.join(","))
			}
		}
	}

	return errors.join("\n")
}
