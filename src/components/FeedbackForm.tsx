import { useState, type FormEvent } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useLang } from '../i18n'

type Mode = 'feedback' | 'bug'
type Status = 'idle' | 'sending' | 'success' | 'error'

const blank = (v: FormDataEntryValue | null) => {
  const s = typeof v === 'string' ? v.trim() : ''
  return s === '' ? null : s
}

export default function FeedbackForm() {
  const { t } = useLang()
  const f = t.form
  const [mode, setMode] = useState<Mode>('feedback')
  const [status, setStatus] = useState<Status>('idle')
  // Store the error as a key so it re-translates if the language changes.
  const [errorKey, setErrorKey] = useState<'errNotConfigured' | 'errRating' | 'errSubmit' | null>(null)
  const [rating, setRating] = useState(0)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    setErrorKey(null)

    if (fd.get('website')) {
      // Honeypot filled by a bot: pretend success, store nothing.
      setStatus('success')
      return
    }
    if (!supabase || !isSupabaseConfigured) {
      setStatus('error')
      setErrorKey('errNotConfigured')
      return
    }
    if (mode === 'feedback' && rating === 0) {
      setStatus('error')
      setErrorKey('errRating')
      return
    }

    setStatus('sending')
    // No .select(): public visitors have INSERT only, they cannot read rows back.
    const { error: dbError } =
      mode === 'feedback'
        ? await supabase.from('feedback').insert({
            player_name: blank(fd.get('name')),
            player_email: blank(fd.get('email')),
            rating,
            category: fd.get('category'),
            message: String(fd.get('message') ?? '').trim(),
          })
        : await supabase.from('bug_reports').insert({
            reporter_name: blank(fd.get('name')),
            reporter_email: blank(fd.get('email')),
            title: String(fd.get('title') ?? '').trim(),
            description: String(fd.get('description') ?? '').trim(),
            steps_to_reproduce: blank(fd.get('steps')),
            system_info: blank(fd.get('system')),
            severity: fd.get('severity'),
          })

    if (dbError) {
      setStatus('error')
      setErrorKey('errSubmit')
      return
    }
    form.reset()
    setRating(0)
    setStatus('success')
  }

  function switchMode(next: Mode) {
    setMode(next)
    setStatus('idle')
    setErrorKey(null)
  }

  return (
    <div className="form-card">
      <div className="tabs" role="tablist" aria-label={f.tabsLabel}>
        <button role="tab" type="button" aria-selected={mode === 'feedback'} onClick={() => switchMode('feedback')}>
          {f.tabFeedback}
        </button>
        <button role="tab" type="button" aria-selected={mode === 'bug'} onClick={() => switchMode('bug')}>
          {f.tabBug}
        </button>
      </div>

      {status === 'success' ? (
        <div className="notice ok" role="status">
          <strong>{f.successTitle}</strong>
          <p>{f.successText}</p>
          <button type="button" className="btn ghost" onClick={() => setStatus('idle')}>
            {f.sendMore}
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} key={mode}>
          <div className="grid2">
            <label>
              {f.name}
              <input name="name" maxLength={80} autoComplete="name" />
            </label>
            <label>
              {f.email}
              <input name="email" type="email" maxLength={254} autoComplete="email" />
            </label>
          </div>

          {/* Honeypot, hidden from people */}
          <input name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />

          {mode === 'feedback' ? (
            <>
              <fieldset className="stars">
                <legend>{f.rating}</legend>
                <div>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={n <= rating ? 'on' : ''}
                      aria-label={f.star(n)}
                      aria-pressed={n === rating}
                      onClick={() => setRating(n)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </fieldset>
              <label>
                {f.category}
                <select name="category" defaultValue="general">
                  {f.categories.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {f.message}
                <textarea name="message" required maxLength={2000} rows={5} />
              </label>
            </>
          ) : (
            <>
              <label>
                {f.bugTitle}
                <input name="title" required maxLength={150} />
              </label>
              <label>
                {f.bugDescription}
                <textarea name="description" required maxLength={3000} rows={4} />
              </label>
              <label>
                {f.bugSteps}
                <textarea name="steps" maxLength={3000} rows={3} />
              </label>
              <div className="grid2">
                <label>
                  {f.severity}
                  <select name="severity" defaultValue="medium">
                    {f.severities.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {f.system}
                  <input name="system" maxLength={500} placeholder={f.systemPlaceholder} />
                </label>
              </div>
            </>
          )}

          {status === 'error' && errorKey && (
            <p className="notice err" role="alert">
              {f[errorKey]}
            </p>
          )}
          <button className="btn primary" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? f.sending : mode === 'feedback' ? f.sendFeedback : f.sendBug}
          </button>
        </form>
      )}
    </div>
  )
}
