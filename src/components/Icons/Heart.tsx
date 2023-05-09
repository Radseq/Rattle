import Image from "next/image"
import heartIcon from "../../../public/icons/heart.svg"

export const Heart = () => {
	return <Image width={15} height={15} src={heartIcon} alt={"heart icon"}></Image>
}
