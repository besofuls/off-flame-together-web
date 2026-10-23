import { useState, type FormEvent } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type Mode = 'feedback' | 'bug'
type Status = 'idle' | 'sending' | 'success' | 'error'

const CATEGORIES: [string, string][] = [
  ['general', 'Chung'],
  ['gameplay', 'Lối chơi'],
  ['controls', 'Điều khiển'],
  ['visuals', 'Đồ họa'],
  ['audio', 'Âm thanh'],
  ['difficulty', 'Độ khó'],
  ['other', 'Khác'],
]
const SEVERITIES: [string, string][] = [
  ['low', 'Thấp'],
  ['medium', 'Trung bình'],
  ['high', 'Cao'],
  ['critical', 'Nghiêm trọng'],
]

const blank = (v: FormDataEntryValue | null) => {
  const s = typeof v === 'string' ? v.trim() : ''
  return s === '' ? null : s
}

export default function FeedbackForm() {
  const [mode, setMode] = useState<Mode>('feedback')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [rating, setRating] = useState(0)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    setError('')

    if (fd.get('website')) {
      // Honeypot filled by a bot: pretend success, store nothing.
      setStatus('success')
      return
    }
    if (!supabase || !isSupabaseConfigured) {
      setStatus('error')
      setError('Hệ thống nhận phản hồi chưa được cấu hình. Vui lòng thử lại sau.')
      return
    }
    if (mode === 'feedback' && rating === 0) {
      setStatus('error')
      setError('Vui lòng chọn số sao đánh giá.')
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
      setError('Không gửi được. Hãy kiểm tra thông tin (email hợp lệ, nội dung không để trống) rồi thử lại.')
      return
    }
    form.reset()
    setRating(0)
    setStatus('success')
  }

  function switchMode(next: Mode) {
    setMode(next)
    setStatus('idle')
    setError('')
  }

  return (
    <div className="form-card">
      <div className="tabs" role="tablist" aria-label="Loại phản hồi">
        <button
          role="tab"
          type="button"
          aria-selected={mode === 'feedback'}
          onClick={() => switchMode('feedback')}
        >
          Góp ý
        </button>
        <button role="tab" type="button" aria-selected={mode === 'bug'} onClick={() => switchMode('bug')}>
          Báo lỗi
        </button>
      </div>

      {status === 'success' ? (
        <div className="notice ok" role="status">
          <strong>Đã gửi – cảm ơn bạn!</strong>
          <p>Phản hồi của bạn đã được lưu cho đội phát triển.</p>
          <button type="button" className="btn ghost" onClick={() => setStatus('idle')}>
            Gửi thêm
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} key={mode} noValidate={false}>
          <div className="grid2">
            <label>
              Tên (không bắt buộc)
              <input name="name" maxLength={80} autoComplete="name" />
            </label>
            <label>
              Email (không bắt buộc)
              <input name="email" type="email" maxLength={254} autoComplete="email" />
            </label>
          </div>

          {/* Honeypot, hidden from people */}
          <input name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />

          {mode === 'feedback' ? (
            <>
              <fieldset className="stars">
                <legend>Mức độ hài lòng *</legend>
                <div>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={n <= rating ? 'on' : ''}
                      aria-label={`${n} sao`}
                      aria-pressed={n === rating}
                      onClick={() => setRating(n)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </fieldset>
              <label>
                Chủ đề
                <select name="category" defaultValue="general">
                  {CATEGORIES.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Góp ý của bạn *
                <textarea name="message" required maxLength={2000} rows={5} />
              </label>
            </>
          ) : (
            <>
              <label>
                Tiêu đề lỗi *
                <input name="title" required maxLength={150} />
              </label>
              <label>
                Mô tả lỗi *
                <textarea name="description" required maxLength={3000} rows={4} />
              </label>
              <label>
                Các bước tái hiện
                <textarea name="steps" maxLength={3000} rows={3} />
              </label>
              <div className="grid2">
                <label>
                  Mức độ
                  <select name="severity" defaultValue="medium">
                    {SEVERITIES.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Cấu hình máy
                  <input name="system" maxLength={500} placeholder="VD: Windows 11, GTX 1650, 16GB" />
                </label>
              </div>
            </>
          )}

          {status === 'error' && (
            <p className="notice err" role="alert">
              {error}
            </p>
          )}
          <button className="btn primary" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Đang gửi…' : mode === 'feedback' ? 'Gửi góp ý' : 'Gửi báo lỗi'}
          </button>
        </form>
      )}
    </div>
  )
}
