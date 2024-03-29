import { type ButtonHTMLAttributes } from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export const PrimaryButton = (props: ButtonProps) => (
	<button
		className="rounded-full bg-blue-500 p-2 font-bold  text-white hover:bg-blue-700 lg:px-4"
		{...props}
	></button>
)

export const PrimaryOutlineButton = (props: ButtonProps) => (
	<button
		className="rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold
		 text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white"
		{...props}
	></button>
)

export const DangerButton = (props: ButtonProps) => {
	const styledClassName = props.className ? props.className : ""
	return (
		<button
			{...props}
			className={`${styledClassName} rounded-full bg-red-500 px-4 py-2 
			font-bold text-white hover:bg-red-700`}
		></button>
	)
}

export const DangerOutlineButton = (props: ButtonProps) => (
	<button
		{...props}
		className="rounded border border-red-500 bg-transparent px-4 py-2 font-semibold
		 	text-red-700 hover:border-transparent hover:bg-red-500 hover:text-white"
	></button>
)
