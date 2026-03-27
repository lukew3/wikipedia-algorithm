import { atom } from 'jotai'

export const recommendationPanelOpenAtom = atom<boolean>(true)
export const resumeBannerDismissedAtom = atom<boolean>(false)
export const searchQueryAtom = atom<string>('')
