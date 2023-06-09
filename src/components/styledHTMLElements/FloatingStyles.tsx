import type { InputHTMLAttributes, SelectHTMLAttributes } from "react"

type HtmlInputProps = InputHTMLAttributes<HTMLInputElement>

export const StyledInput = (props: HtmlInputProps) => (
	<input
		{...props}
		className="peer block w-full appearance-none rounded-lg border
			border-gray-300 bg-transparent px-2.5 pb-2.5 pt-4 text-sm 
			text-gray-900 focus:border-blue-600 focus:ring-0"
	/>
)

type HtmlTextAreaProps = InputHTMLAttributes<HTMLTextAreaElement> & { rows: number }

export const StyledTextArea = (props: HtmlTextAreaProps) => (
	<textarea
		{...props}
		className="peer block w-full appearance-none rounded-lg border
			border-gray-300 bg-transparent px-2.5 pb-2.5 pt-4 text-sm 
			text-gray-900 focus:border-blue-600 focus:ring-0"
	/>
)

type HtmlLabelProps = InputHTMLAttributes<HTMLLabelElement> & {
	htmlFor: string
	side: "left" | "right"
}

export const StyledLabel = (props: HtmlLabelProps) => {
	const { side: side, ...restProps } = props
	return (
		<label
			{...restProps}
			className={`absolute top-2 ${
				side === "left" ? "left-1" : "right-1"
			} z-10 origin-[0] -translate-y-4 
			scale-75 bg-white px-2 text-sm text-gray-500 
			duration-300 peer-placeholder-shown:top-1/2 
			peer-placeholder-shown:-translate-y-1/2 
			peer-placeholder-shown:scale-100 peer-focus:top-2 
			peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 
			peer-focus:text-blue-600`}
		>
			{restProps.children}
		</label>
	)
}

type HtmlSelectProps = SelectHTMLAttributes<HTMLSelectElement>

export const StyledSelect = (props: HtmlSelectProps) => {
	const styledClassName = props.className ? props.className : ""
	return (
		<select
			{...props}
			className={`${styledClassName} peer block appearance-none rounded-lg border
		border-gray-300 bg-transparent px-2.5 pb-2.5 pt-4 text-sm 
		text-gray-900 focus:border-blue-600 focus:ring-0`}
		>
			{props.children}
		</select>
	)
}
