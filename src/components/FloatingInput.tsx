import { type FC } from "react"

const LabelCounter: FC<{ maxLength: number; charsLeft: number; htmlFor: string }> = ({
	maxLength,
	charsLeft,
	htmlFor,
}) => {
	return (
		<label
			htmlFor={htmlFor}
			className="absolute top-2 right-1 z-10 origin-[0] -translate-y-4 
				scale-75 transform bg-white px-2 text-sm text-gray-500 
				duration-300 peer-placeholder-shown:top-1/2 
				peer-placeholder-shown:-translate-y-1/2 
				peer-placeholder-shown:scale-100 peer-focus:top-2 
				peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 
				peer-focus:text-blue-600"
		>
			{`${maxLength}/${charsLeft}`}
		</label>
	)
}

const Label: FC<{ name: string }> = ({ name }) => {
	return (
		<label
			htmlFor={name}
			className="absolute top-2 left-1 z-10 origin-[0] -translate-y-4 
				scale-75 transform bg-white px-2 text-sm text-gray-500 
				duration-300 peer-placeholder-shown:top-1/2 
				peer-placeholder-shown:-translate-y-1/2 
				peer-placeholder-shown:scale-100 peer-focus:top-2 
				peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 
				peer-focus:text-blue-600"
		>
			{name}
		</label>
	)
}

export const FloatingInput: FC<{
	labelName: string
	handleOnChange: CallableFunction
	inputValue: string
	maxLength?: number
}> = ({ labelName, handleOnChange, inputValue, maxLength }) => {
	const charsLeft: number | null = maxLength ? maxLength - inputValue.length : null

	return (
		<div className="relative">
			<input
				type="text"
				id={labelName}
				className="peer block w-full appearance-none rounded-lg border
                    border-gray-300 bg-transparent px-2.5 pb-2.5 pt-4 text-sm 
                    text-gray-900 focus:border-blue-600 focus:ring-0"
				placeholder=""
				value={inputValue}
				onChange={(e) => {
					if (charsLeft) {
						const calcLenth = charsLeft - (e.target.value.length - inputValue.length)

						if (calcLenth <= 0) {
							return
						}
					}
					handleOnChange(e.target.value)
					e.preventDefault()
				}}
			/>
			<Label name={labelName} />
			{maxLength && charsLeft && (
				<LabelCounter charsLeft={charsLeft} htmlFor={labelName} maxLength={maxLength} />
			)}
		</div>
	)
}

export const FloatingTextArea: FC<{
	labelName: string
	handleOnChange: CallableFunction
	inputValue: string
	rows: number
	maxLength?: number
}> = ({ labelName, handleOnChange, inputValue, maxLength, rows }) => {
	const charsLeft: number | null = maxLength ? maxLength - inputValue.length : null

	return (
		<div className="relative">
			<textarea
				id={labelName}
				rows={rows}
				className="peer block w-full appearance-none rounded-lg border
										border-gray-300 bg-transparent px-2.5 pb-2.5 pt-4 text-sm 
										text-gray-900 focus:border-blue-600 focus:ring-0"
				placeholder=""
				value={inputValue}
				onChange={(e) => {
					if (charsLeft) {
						const calcLenth = charsLeft - (e.target.value.length - inputValue.length)

						if (calcLenth <= 0) {
							return
						}
					}
					handleOnChange(e.target.value)
					e.preventDefault()
				}}
			/>
			<Label name={labelName} />
			{maxLength && charsLeft && (
				<LabelCounter charsLeft={charsLeft} htmlFor={labelName} maxLength={maxLength} />
			)}
		</div>
	)
}
