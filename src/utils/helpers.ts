import { type typeToFlattenedError } from "zod"

/* eslint-disable  @typescript-eslint/no-explicit-any */
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

export const getFullName = (frstName: string | null, lastName: string | null) => {
	let fullName = frstName
	if (fullName && lastName) {
		fullName += " " + lastName
	}
	return fullName
}
