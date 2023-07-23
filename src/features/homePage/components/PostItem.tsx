import type { FC, PropsWithChildren, ReactNode } from "react"

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { type HomePost } from "../types"
import { type PostMenuItemsType } from "~/components/postsPage/types"
import { ProfileAvatarImageUrl } from "~/components/profile/ProfileAvatarImageUrl"
import { PostTitle } from "~/components/postsPage/PostTitle"
import { PostOptionMenu } from "~/components/postsPage/PostOptionMenu"
import { Icon } from "~/components/Icon"

dayjs.extend(relativeTime)

export type ClickCapture = {
	action: "deletePost" | "navigation"
}

export const PostItem: FC<
	{
		postWithUser: HomePost
		menuItemsType: PostMenuItemsType
		onClickCapture: (clickCapture: ClickCapture) => void
		footer?: ReactNode
	} & PropsWithChildren
> = ({ postWithUser, menuItemsType, onClickCapture, footer, children }) => {
	const { post, author } = postWithUser
	return (
		<li
			className="cursor-pointer rounded-lg py-2 hover:bg-gray-100"
			onClick={() => {
				onClickCapture({
					action: "navigation",
				})
			}}
		>
			<main className="flex">
				<ProfileAvatarImageUrl src={author.profileImageUrl} />
				<div className="w-full pl-2">
					<PostTitle author={author} createdAt={post.createdAt} />
					{children}
					{footer}
				</div>
				{menuItemsType !== "view" && (
					<div className="group relative flex h-12 w-1/12 justify-center rounded-full hover:bg-gray-200">
						<Icon iconKind="optionDots" />
						<div className="hidden group-hover:block">
							<PostOptionMenu
								menuItemsType={menuItemsType}
								onMenuItemClick={(_) =>
									onClickCapture({
										action: "deletePost",
									})
								}
							/>
						</div>
					</div>
				)}
			</main>
		</li>
	)
}
