import { type User } from "@clerk/nextjs/dist/api"
import { type typeToFlattenedError } from "zod"
import { type PostWithAuthor } from "~/components/postsPage/types"
import { type PostAuthor } from "~/components/profilePage/types"

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

export const filterClarkClientToUser = (user: User) => {
	return {
		id: user.id,
		username: user.username ?? "",
		profileImageUrl: user.profileImageUrl,
		fullName: getFullName(user.firstName, user.lastName),
	} as PostAuthor
}

export const canOpenPostQuoteDialog = (post: PostWithAuthor | null, user: User | undefined) => {
	if (post && user) {
		return true
	}
	return false
}

export const createAndIncrementFill = (arrayLength: number, minValue = 0) => {
	const result: number[] = []
	for (let index = minValue; index < arrayLength; index++) {
		result.push(index)
	}
	return result
}
