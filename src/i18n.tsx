import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { copy, type Copy, type Lang } from './content'

const KEY = 'oft-lang'

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'vi' || saved === 'en') return saved
  } catch {
    /* storage unavailable */
  }
  // Default is Vietnamese; English only if the browser is set to English.
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'vi'
}

type Ctx = { lang: Lang; t: Copy; toggle: () => void }
const LangContext = createContext<Ctx | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)
  const t = copy[lang]

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t.metaTitle
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.metaDescription)
    try {
      localStorage.setItem(KEY, lang)
    } catch {
      /* ignore */
    }
  }, [lang, t])

  const value = useMemo<Ctx>(() => ({ lang, t, toggle: () => setLang((l) => (l === 'vi' ? 'en' : 'vi')) }), [lang, t])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
