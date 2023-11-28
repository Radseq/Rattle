import { type FC, type PropsWithChildren, useEffect, useRef, useState } from "react"
import { Icon } from "../Icon"

export const Dialog: FC<{ open: boolean; onClose: () => void } & PropsWithChildren> = ({
	children,
	open,
	onClose,
}) => {
	const modalRef = useRef<HTMLDialogElement | null>(null)
	const [canOpen, setCanOpen] = useState(open)

	useEffect(() => {
		if (canOpen && modalRef.current) {
			modalRef.current.showModal()
		}
	}, [canOpen])

	const handleClose = () => {
		if (modalRef.current) {
			modalRef.current.close()
		}
		setCanOpen(false)
		onClose()
	}

	return (
		<dialog ref={modalRef} onClose={handleClose} className="fixed rounded-lg">
			<article onClick={(e) => e.stopPropagation()}>
				<header>
					<button
						className="h-8 w-8 p-1"
						onClick={(e) => {
							e.stopPropagation()
							handleClose()
						}}
					>
						<Icon iconKind="cross" />
					</button>
				</header>
				{children}
			</article>
		</dialog>
	)
}
