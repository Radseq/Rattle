import React, {
	type PropsWithChildren,
	type SetStateAction,
	useContext,
	useMemo,
	useState,
} from "react"
import { type CreatedPost } from "../types"

const CreatePostContext = React.createContext<CreatedPost>({
	isCreatedPost: false,
	setIsCreatedPost: (prevState: SetStateAction<boolean>) => prevState,
})

const CreatePostProvider = (props: PropsWithChildren) => {
	const [isCreatedPost, setIsCreatedPost] = useState<boolean>(false)

	const value = useMemo(
		() => ({ isCreatedPost, setIsCreatedPost }),
		[isCreatedPost, setIsCreatedPost],
	)

	return <CreatePostContext.Provider value={value}>{props.children}</CreatePostContext.Provider>
}

const CreatePostConsumer = CreatePostContext.Consumer

const useCreatePost = () => useContext(CreatePostContext)

export { CreatePostProvider, CreatePostConsumer, useCreatePost }
