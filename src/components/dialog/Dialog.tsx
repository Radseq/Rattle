import { type FC, type PropsWithChildren, useEffect, useRef, useState } from "react"

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
		setCanOpen(false)
		onClose()
	}

	return (
		<dialog ref={modalRef} onClose={handleClose} className="fixed rounded-lg">
			{children}
		</dialog>
	)
}
