import type { FC, PropsWithChildren, ReactNode } from "react"

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { Icon } from "~/components/Icon"
import type { PostProfileType, PostWithAuthor } from "./types"
import { ProfileAvatarImageUrl } from "~/features/profile"
import { PostTitle } from "../postsPage/PostTitle"
import { PostOptionMenu } from "../postsPage/PostOptionMenu"

dayjs.extend(relativeTime)

export type ClickCapture = {
	action: "deletePost" | "navigation"
}

export const PostItem: FC<
	{
		postWithUser: PostWithAuthor
		menuItemsType: PostProfileType
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
			<article className="flex">
				<ProfileAvatarImageUrl src={author.profileImageUrl} />
				<div className="w-full pl-2">
					<PostTitle
						fullName={author.fullName}
						username={author.username}
						createdAt={post.createdAt}
					/>
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
			</article>
		</li>
	)
}
