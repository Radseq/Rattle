import { useEffect, useState } from "react"
import type { Profile, SearchResult } from "../types"

//todo add to config
const LIMIT_TAG_ENTITIES = 7
const LIMIT_PROFILE_ENTITIES = 8

type Observer = (history: SearchResult) => void

const empty: SearchResult = {
	searchedProfiles: [],
	searchedTags: [],
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

	const value = load()
	return {
		subscribe: (observer: Observer) => {
			observers.add(observer)
			return () => {
				observers.delete(observer)
			}
		},
		add: (history: string | Profile) => {
			if (typeof history === "object") {
				if (value.searchedProfiles.length === LIMIT_PROFILE_ENTITIES) {
					return
				}
				if (!value.searchedProfiles.find((profile) => profile.id === history.id)) {
					value.searchedProfiles = [...value.searchedProfiles, history]
				}
			} else if (value.searchedTags.length < LIMIT_TAG_ENTITIES) {
				if (!value.searchedTags.find((tag) => tag === history)) {
					value.searchedTags = [...value.searchedTags, history]
				}
			}
			save(value)
			observers.forEach((observer) => observer(value))
		},
		remove: (entry: string | Profile) => {
			if (typeof entry === "object") {
				value.searchedProfiles = value.searchedProfiles.filter((it) => it.id !== entry.id)
			} else {
				value.searchedTags = value.searchedTags.filter((it) => it !== entry)
			}
			save(value)
			observers.forEach((observer) => observer(value))
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
