import clerkClient from "@clerk/clerk-sdk-node"
import { prisma } from "../db"
import { Profile } from "~/components/profilePage/types"
import { getFullName } from "~/utils/helpers"

export const getProfileByUserName = async (userName: string) => {
	const authors = await clerkClient.users.getUserList({
		username: [userName],
	})

	if (authors.length > 1 || !authors[0]) {
		return null
	}

	const author = authors[0]

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
		bannerImgUrl: authorLocal && authorLocal.bannerImageUrl,
		bio: authorLocal && authorLocal.bio,
		webPage: authorLocal && authorLocal.webPage,
	} as Profile
}
