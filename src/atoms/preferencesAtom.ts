import { atomWithStorage } from 'jotai/utils'

export interface UserPreferences {
  finishedThreshold: number
  showResumeReminders: boolean
  graphLayout: 'force' | 'tree'
  darkMode: boolean
  maxHistoryDays: number
}

const DEFAULTS: UserPreferences = {
  finishedThreshold: 0.8,
  showResumeReminders: true,
  graphLayout: 'force',
  darkMode: false,
  maxHistoryDays: 90,
}

export const preferencesAtom = atomWithStorage<UserPreferences>('wikiapp:preferences', DEFAULTS)
