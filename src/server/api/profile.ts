import clerkClient from "@clerk/clerk-sdk-node"
import { prisma } from "../db"
import type { Profile, ProfileExtend } from "~/components/profilePage/types"
import { getFullName } from "~/utils/helpers"

export const getProfileByUserName = async (userName: string) => {
	const authors = await clerkClient.users.getUserList({
		username: [userName],
	})

	if (authors.length > 1 || !authors[0]) {
		return null
	}

	const author = authors[0]

	const extended = author.publicMetadata.extended as ProfileExtend | null

	if (!author.username) {
		return null
	}

	const authorLocal = await prisma.user.findFirst({
		where: {
			id: author.id,
		},
	})

	return {
		id: author.id,
		username: author.username ?? "",
		profileImageUrl: (authorLocal && authorLocal.profileImageUrl) ?? author.profileImageUrl,
		fullName: getFullName(author.firstName, author.lastName),
		createdAt: author.createdAt,
		extended: extended,
	} as Profile
}
