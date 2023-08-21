import { useEffect, useState } from "react"
import type { Profile, SearchResult } from "../types"
import { CONFIG } from "~/config"

type Observer = (history: SearchResult) => void

const empty: SearchResult = {
	searchedProfiles: [],
	searchedTags: [],
}

const copySearchResult = (value: SearchResult) => {
	return {
		...value,
		searchedProfiles: [...value.searchedProfiles],
		searchedTags: [...value.searchedTags],
	}
}

const load = (): SearchResult => {
	if (typeof window !== "undefined") {
		const rawHistory = localStorage.getItem("search_history")
		return rawHistory ? (JSON.parse(rawHistory) as SearchResult) : empty
	}
	return empty
}
const save = (history: SearchResult) => {
	localStorage.setItem("search_history", JSON.stringify(history))
}

const observedHistory = (() => {
	const observers = new Set<Observer>()

	let value = load()
	return {
		subscribe: (observer: Observer) => {
			observers.add(observer)
			return () => {
				observers.delete(observer)
			}
		},
		add: (history: string | Profile) => {
			const copiedValue = copySearchResult(value)
			if (typeof history === "object") {
				if (value.searchedProfiles.length === CONFIG.LIMIT_PROFILE_ENTITIES) {
					return
				}
				if (!value.searchedProfiles.find((profile) => profile.id === history.id)) {
					copiedValue.searchedProfiles.push(history)
				}
			} else if (value.searchedTags.length < CONFIG.LIMIT_TAG_ENTITIES) {
				if (!value.searchedTags.find((tag) => tag === history)) {
					copiedValue.searchedTags.push(history)
				}
			}
			value = copiedValue
			save(copiedValue)
			observers.forEach((observer) => observer(copiedValue))
		},
		remove: (entry: string | Profile) => {
			const copiedValue = copySearchResult(value)
			if (typeof entry === "object") {
				copiedValue.searchedProfiles = value.searchedProfiles.filter(
					(it) => it.id !== entry.id
				)
			} else {
				copiedValue.searchedTags = value.searchedTags.filter((it) => it !== entry)
			}
			value = copiedValue
			save(copiedValue)
			observers.forEach((observer) => observer(copiedValue))
		},
		value,
	} as const
})()

export const useSearchHistory = () => {
	const [history, setHistory] = useState<SearchResult>(observedHistory.value)

	useEffect(() => observedHistory.subscribe(setHistory), [])

	return {
		history,
		add: (entry: string | Profile) => observedHistory.add(entry),
		remove: (entry: string | Profile) => observedHistory.remove(entry),
	} as const
}
