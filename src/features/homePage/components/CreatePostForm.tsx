import type { FC, PropsWithChildren } from "react"
import { ProfileAvatarImageUrl } from "~/features/profile"

type CreatePostProps = {
	profileImageUrl: string
	onMessageChange: (msg: string) => void
	inputMessage: string
} & PropsWithChildren

export const CreatePostForm: FC<CreatePostProps> = ({
	profileImageUrl,
	onMessageChange,
	inputMessage,
	children,
}) => {
	return (
		<header className="flex">
			<ProfileAvatarImageUrl src={profileImageUrl} />
			<div className="w-full pl-1">
				<input
					className="w-full rounded-xl border-2 border-solid p-1 text-lg outline-none"
					placeholder={inputMessage}
					onChange={(e) => onMessageChange(e.target.value)}
					type="text"
				></input>
				{children}
			</div>
		</header>
	)
}
