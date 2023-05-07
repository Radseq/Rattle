import { type ButtonHTMLAttributes } from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export const PrimalyButton = (props: ButtonProps) => {
	return (
		<button
			className="rounded-full bg-blue-500 py-2 px-4  font-bold text-white hover:bg-blue-700"
			{...props}
		></button>
	)
}

export const DangerButton = (props: ButtonProps) => {
	return (
		<button
			className="rounded-full bg-red-500 py-2 px-4  font-bold text-white hover:bg-red-700"
			{...props}
		></button>
	)
}
