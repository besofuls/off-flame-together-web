import { useCallback, useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  isSupabaseConfigured,
  supabase,
  type AnalyticsSnapshotRow,
  type BugReportRow,
  type BugSeverity,
  type BugStatus,
  type BuildRow,
  type DataOrigin,
  type FeedbackRow,
  type WindowType,
} from '../lib/supabase'
import { useLang } from '../i18n'

type AdminTab = 'overview' | 'bugs' | 'feedback' | 'builds' | 'analytics'

const BUG_STATUSES: BugStatus[] = ['open', 'in_progress', 'resolved', 'closed']
const BUG_SEVERITIES: BugSeverity[] = ['low', 'medium', 'high', 'critical']

export default function AdminDashboard({ onExit }: { onExit: () => void }) {
  const { lang, toggle } = useLang()
  const vi = lang === 'vi'

  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loginError, setLoginError] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)

  const [tab, setTab] = useState<AdminTab>('overview')
  const [loadingData, setLoadingData] = useState(false)
  const [dataError, setDataError] = useState('')
  const [actionNotice, setActionNotice] = useState('')

  const [builds, setBuilds] = useState<BuildRow[]>([])
  const [feedback, setFeedback] = useState<FeedbackRow[]>([])
  const [bugs, setBugs] = useState<BugReportRow[]>([])
  const [snapshots, setSnapshots] = useState<AnalyticsSnapshotRow[]>([])

  // Filters
  const [bugStatusFilter, setBugStatusFilter] = useState<string>('all')
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('all')

  // Build editor state
  const [editingBuild, setEditingBuild] = useState<BuildRow | null>(null)
  // Snapshot editor state
  const [editingSnapshot, setEditingSnapshot] = useState<AnalyticsSnapshotRow | null>(null)

  const checkAdminRole = useCallback(async (activeSession: Session | null) => {
    if (!supabase || !activeSession) {
      setIsAdmin(null)
      setAuthLoading(false)
      return
    }
    setAuthLoading(true)
    const { data, error } = await supabase.rpc('is_admin')
    if (error) {
      setIsAdmin(false)
    } else {
      setIsAdmin(Boolean(data))
    }
    setAuthLoading(false)
  }, [])

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      checkAdminRole(data.session)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      checkAdminRole(nextSession)
    })
    return () => sub.subscription.unsubscribe()
  }, [checkAdminRole])

  const loadAllData = useCallback(async () => {
    if (!supabase || !isAdmin) return
    setLoadingData(true)
    setDataError('')
    const [bRes, fRes, bugRes, aRes] = await Promise.all([
      supabase.from('builds').select('*').order('created_at', { ascending: false }),
      supabase.from('feedback').select('*').order('created_at', { ascending: false }),
      supabase.from('bug_reports').select('*').order('created_at', { ascending: false }),
      supabase
        .from('analytics_snapshots')
        .select('*, traffic_referrers(*)')
        .order('window_end_date', { ascending: false }),
    ])

    const firstErr = bRes.error || fRes.error || bugRes.error || aRes.error
    if (firstErr) {
      setDataError(firstErr.message)
    } else {
      setBuilds((bRes.data as BuildRow[]) ?? [])
      setFeedback((fRes.data as FeedbackRow[]) ?? [])
      setBugs((bugRes.data as BugReportRow[]) ?? [])
      setSnapshots((aRes.data as AnalyticsSnapshotRow[]) ?? [])
    }
    setLoadingData(false)
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin) {
      loadAllData()
    }
  }, [isAdmin, loadAllData])

  function flash(msg: string) {
    setActionNotice(msg)
    setTimeout(() => setActionNotice(''), 4000)
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!supabase) return
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') ?? '').trim()
    const password = String(fd.get('password') ?? '')
    setLoginError('')
    setLoginBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoginBusy(false)
    if (error) {
      setLoginError(
        vi
          ? `Đăng nhập thất bại: ${error.message}`
          : `Sign-in failed: ${error.message}`,
      )
    }
  }

  async function handleSignOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    setIsAdmin(null)
    setBuilds([])
    setFeedback([])
    setBugs([])
    setSnapshots([])
  }

  async function handleBugUpdate(bugId: string, patch: Partial<Pick<BugReportRow, 'status' | 'severity' | 'build_id'>>) {
    if (!supabase) return
    setDataError('')
    const { data, error } = await supabase
      .from('bug_reports')
      .update(patch)
      .eq('id', bugId)
      .select('*')
      .single()
    if (error) {
      setDataError(error.message)
      return
    }
    setBugs((prev) => prev.map((b) => (b.id === bugId ? (data as BugReportRow) : b)))
    flash(vi ? 'Đã cập nhật báo lỗi.' : 'Bug report updated.')
  }

  async function handleDeleteBug(bugId: string) {
    if (!supabase) return
    const { error } = await supabase.from('bug_reports').delete().eq('id', bugId)
    if (error) {
      setDataError(error.message)
      return
    }
    setBugs((prev) => prev.filter((b) => b.id !== bugId))
    flash(vi ? 'Đã xóa báo lỗi.' : 'Bug report deleted.')
  }

  async function handleDeleteFeedback(feedbackId: string) {
    if (!supabase) return
    const { error } = await supabase.from('feedback').delete().eq('id', feedbackId)
    if (error) {
      setDataError(error.message)
      return
    }
    setFeedback((prev) => prev.filter((f) => f.id !== feedbackId))
    flash(vi ? 'Đã xóa góp ý.' : 'Feedback deleted.')
  }

  async function handleSaveBuild(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!supabase) return
    const form = e.currentTarget
    const fd = new FormData(form)
    const payload = {
      version: String(fd.get('version') ?? '').trim(),
      title: String(fd.get('title') ?? '').trim() || null,
      download_url: String(fd.get('download_url') ?? '').trim() || null,
      released_at: String(fd.get('released_at') ?? '').trim() || null,
      release_notes: String(fd.get('release_notes') ?? '').trim() || null,
      is_published: fd.get('is_published') === 'on',
    }
    setDataError('')
    if (editingBuild) {
      const { data, error } = await supabase
        .from('builds')
        .update(payload)
        .eq('id', editingBuild.id)
        .select('*')
        .single()
      if (error) {
        setDataError(error.message)
        return
      }
      setBuilds((prev) => prev.map((b) => (b.id === editingBuild.id ? (data as BuildRow) : b)))
      setEditingBuild(null)
      form.reset()
      flash(vi ? 'Đã cập nhật phiên bản build.' : 'Build metadata updated.')
    } else {
      const { data, error } = await supabase.from('builds').insert(payload).select('*').single()
      if (error) {
        setDataError(error.message)
        return
      }
      setBuilds((prev) => [data as BuildRow, ...prev])
      form.reset()
      flash(vi ? 'Đã tạo phiên bản build mới.' : 'New build version created.')
    }
  }

  async function handleToggleBuildPublished(build: BuildRow) {
    if (!supabase) return
    const { data, error } = await supabase
      .from('builds')
      .update({ is_published: !build.is_published })
      .eq('id', build.id)
      .select('*')
      .single()
    if (error) {
      setDataError(error.message)
      return
    }
    setBuilds((prev) => prev.map((b) => (b.id === build.id ? (data as BuildRow) : b)))
    flash(vi ? 'Đã đổi trạng thái công khai của build.' : 'Build publication status updated.')
  }

  async function handleDeleteBuild(buildId: string) {
    if (!supabase) return
    const { error } = await supabase.from('builds').delete().eq('id', buildId)
    if (error) {
      setDataError(error.message)
      return
    }
    setBuilds((prev) => prev.filter((b) => b.id !== buildId))
    flash(vi ? 'Đã xóa bản build.' : 'Build deleted.')
  }

  async function handleCreateSnapshot(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!supabase) return
    const form = e.currentTarget
    const fd = new FormData(form)
    const numOrNull = (k: string) => {
      const raw = String(fd.get(k) ?? '').trim()
      return raw === '' ? null : Number(raw)
    }
    const payload = {
      source: fd.get('source') as 'itch.io' | 'landing_page',
      window_type: fd.get('window_type') as WindowType,
      window_start_date: String(fd.get('window_start_date') ?? '').trim(),
      window_end_date: String(fd.get('window_end_date') ?? '').trim(),
      captured_on: String(fd.get('captured_on') ?? '').trim(),
      views: numOrNull('views'),
      unique_views: numOrNull('unique_views'),
      downloads: numOrNull('downloads'),
      data_origin: fd.get('data_origin') as DataOrigin,
      notes: String(fd.get('notes') ?? '').trim() || null,
    }
    setDataError('')
    const { error } = await supabase.from('analytics_snapshots').insert(payload)
    if (error) {
      setDataError(error.message)
      return
    }
    form.reset()
    await loadAllData()
    flash(vi ? 'Đã lưu snapshot analytics.' : 'Analytics snapshot recorded.')
  }

  async function handleAddReferrer(e: FormEvent<HTMLFormElement>, snapshotId: string) {
    e.preventDefault()
    if (!supabase) return
    const form = e.currentTarget
    const fd = new FormData(form)
    const referrer = String(fd.get('referrer') ?? '').trim()
    const views = Number(fd.get('views') ?? 0)
    setDataError('')
    const { error } = await supabase
      .from('traffic_referrers')
      .insert({ snapshot_id: snapshotId, referrer, views })
    if (error) {
      setDataError(error.message)
      return
    }
    form.reset()
    await loadAllData()
    flash(vi ? 'Đã thêm nguồn truy cập.' : 'Traffic referrer added.')
  }

  async function handleUpdateSnapshot(e: FormEvent<HTMLFormElement>, snapshotId: string) {
    e.preventDefault()
    if (!supabase) return
    const form = e.currentTarget
    const fd = new FormData(form)
    const numOrNull = (k: string) => {
      const raw = String(fd.get(k) ?? '').trim()
      return raw === '' ? null : Number(raw)
    }
    const payload = {
      captured_on: String(fd.get('captured_on') ?? '').trim(),
      views: numOrNull('views'),
      unique_views: numOrNull('unique_views'),
      downloads: numOrNull('downloads'),
      notes: String(fd.get('notes') ?? '').trim() || null,
    }
    setDataError('')
    const { error } = await supabase.from('analytics_snapshots').update(payload).eq('id', snapshotId)
    if (error) {
      setDataError(error.message)
      return
    }
    setEditingSnapshot(null)
    await loadAllData()
    flash(vi ? 'Đã cập nhật số liệu snapshot.' : 'Analytics snapshot updated.')
  }

  async function handleDeleteSnapshot(snapshotId: string) {
    if (!supabase) return
    if (!window.confirm(vi ? 'Bạn có chắc chắn muốn xóa snapshot này?' : 'Are you sure you want to delete this snapshot?')) return
    setDataError('')
    const { error } = await supabase.from('analytics_snapshots').delete().eq('id', snapshotId)
    if (error) {
      setDataError(error.message)
      return
    }
    await loadAllData()
    flash(vi ? 'Đã xóa snapshot.' : 'Snapshot deleted.')
  }

  async function handleDeleteReferrer(referrerId: string) {
    if (!supabase) return
    setDataError('')
    const { error } = await supabase.from('traffic_referrers').delete().eq('id', referrerId)
    if (error) {
      setDataError(error.message)
      return
    }
    await loadAllData()
    flash(vi ? 'Đã xóa nguồn truy cập.' : 'Referrer removed.')
  }

  const buildLabel = (buildId: string | null) => {
    if (!buildId) return '—'
    const found = builds.find((b) => b.id === buildId)
    return found ? found.version : buildId.slice(0, 8)
  }

  const avgRating =
    feedback.length > 0
      ? (feedback.reduce((sum, r) => sum + r.rating, 0) / feedback.length).toFixed(1)
      : '—'

  const openBugs = bugs.filter((b) => b.status === 'open').length
  const inProgressBugs = bugs.filter((b) => b.status === 'in_progress').length
  const resolvedBugs = bugs.filter((b) => b.status === 'resolved' || b.status === 'closed').length
  const publishedBuilds = builds.filter((b) => b.is_published).length
  const latestItch30d = snapshots.find((s) => s.source === 'itch.io' && s.window_type === '30d')

  const filteredBugs = bugStatusFilter === 'all' ? bugs : bugs.filter((b) => b.status === bugStatusFilter)
  const filteredFeedback =
    feedbackCategoryFilter === 'all' ? feedback : feedback.filter((f) => f.category === feedbackCategoryFilter)

  return (
    <div className="admin-shell">
      <header className="nav">
        <a
          className="brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            onExit()
          }}
        >
          Off Flame Together <span className="admin-badge">ADMIN</span>
        </a>
        <div className="admin-header-actions">
          <button type="button" className="lang" onClick={toggle}>
            <span className={lang === 'vi' ? 'on' : ''}>VI</span>
            <span className={lang === 'en' ? 'on' : ''}>EN</span>
          </button>
          <button type="button" className="btn ghost" onClick={onExit}>
            {vi ? '← Về Landing Page' : '← Public Landing Page'}
          </button>
          {session && (
            <button type="button" className="btn ghost" onClick={handleSignOut}>
              {vi ? 'Đăng xuất' : 'Sign out'}
            </button>
          )}
        </div>
      </header>

      <main className="wrap admin-main">
        {!isSupabaseConfigured ? (
          <div className="form-card">
            <p className="kicker">Supabase</p>
            <h2>{vi ? 'Chưa cấu hình kết nối Supabase' : 'Supabase is not configured'}</h2>
            <p>
              {vi
                ? 'Vui lòng thiết lập VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong file .env hoặc GitHub Actions Variables.'
                : 'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env or GitHub Actions Variables.'}
            </p>
          </div>
        ) : authLoading ? (
          <div className="form-card">
            <p>{vi ? 'Đang kiểm tra phiên đăng nhập…' : 'Checking authentication session…'}</p>
          </div>
        ) : !session ? (
          <section className="admin-login-wrap">
            <div className="form-card">
              <p className="kicker">{vi ? ' Khu vực bảo mật' : 'Protected Area'}</p>
              <h2>{vi ? 'Đăng nhập Quản trị Beta' : 'Beta Admin Sign In'}</h2>
              <form onSubmit={handleLogin}>
                <label>
                  Email *
                  <input name="email" type="email" required autoComplete="username" placeholder="admin@example.com" />
                </label>
                <label>
                  {vi ? 'Mật khẩu *' : 'Password *'}
                  <input name="password" type="password" required autoComplete="current-password" />
                </label>
                {loginError && (
                  <p className="notice err" role="alert">
                    {loginError}
                  </p>
                )}
                <button className="btn primary" type="submit" disabled={loginBusy}>
                  {loginBusy ? (vi ? 'Đang đăng nhập…' : 'Signing in…') : vi ? 'Đăng nhập' : 'Sign in'}
                </button>
              </form>
            </div>
          </section>
        ) : !isAdmin ? (
          <section className="form-card">
            <p className="kicker">{vi ? 'Truy cập bị từ chối (403)' : 'Access Denied (403)'}</p>
            <h2>{vi ? 'Tài khoản chưa có quyền Admin' : 'Account is not an authorized Admin'}</h2>
            <p>
              {vi
                ? `Bạn đã đăng nhập với email ${session.user.email}, nhưng tài khoản này chưa có trong bảng public.admin_users. Chính sách RLS của PostgreSQL chặn toàn bộ quyền đọc/ghi dữ liệu quản trị.`
                : `You are signed in as ${session.user.email}, but this user is not listed in public.admin_users. PostgreSQL RLS policies block all admin reads and writes.`}
            </p>
            <p>
              {vi
                ? 'Để cấp quyền Admin cho tài khoản này, hãy mở Supabase → SQL Editor và chạy câu lệnh sau:'
                : 'To grant Admin privileges to this account, open Supabase → SQL Editor and run:'}
            </p>
            <pre className="sql-snippet">
              {`insert into public.admin_users (user_id, email)\nvalues ('${session.user.id}', '${session.user.email}');`}
            </pre>
            <div className="cta-row">
              <button type="button" className="btn primary" onClick={() => checkAdminRole(session)}>
                {vi ? 'Kiểm tra lại quyền' : 'Re-check privileges'}
              </button>
              <button type="button" className="btn ghost" onClick={handleSignOut}>
                {vi ? 'Đăng xuất' : 'Sign out'}
              </button>
            </div>
          </section>
        ) : (
          <>
            <div className="admin-top-bar">
              <div>
                <p className="kicker">{vi ? 'Quản trị Beta · Off Flame Together' : 'Beta Management · Off Flame Together'}</p>
                <h2>{vi ? 'Bảng điều khiển Admin' : 'Admin Dashboard'}</h2>
              </div>
              <div className="admin-user-meta">
                <span>
                  {vi ? 'Tài khoản:' : 'Signed in:'} <strong>{session.user.email}</strong>
                </span>
                <button type="button" className="btn ghost" onClick={loadAllData} disabled={loadingData}>
                  {loadingData ? (vi ? 'Đang tải…' : 'Refreshing…') : vi ? 'Làm mới dữ liệu' : 'Refresh data'}
                </button>
              </div>
            </div>

            {actionNotice && (
              <p className="notice ok" role="status">
                {actionNotice}
              </p>
            )}
            {dataError && (
              <p className="notice err" role="alert">
                {dataError}
              </p>
            )}

            {/* Summary counts */}
            <section className="stat-grid" aria-label={vi ? 'Thống kê tổng quan' : 'Summary counts'}>
              <div className="stat-card">
                <span className="stat-label">{vi ? 'Góp ý người chơi' : 'Player Feedback'}</span>
                <strong className="stat-num">{feedback.length}</strong>
                <span className="stat-sub">
                  {vi ? `Điểm TB: ${avgRating} ★` : `Avg rating: ${avgRating} ★`}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">{vi ? 'Báo cáo lỗi (Bug Reports)' : 'Bug Reports'}</span>
                <strong className="stat-num">{bugs.length}</strong>
                <span className="stat-sub">
                  {vi
                    ? `${openBugs} mở · ${inProgressBugs} đang xử lý · ${resolvedBugs} đã xử lý`
                    : `${openBugs} open · ${inProgressBugs} in progress · ${resolvedBugs} resolved/closed`}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">{vi ? 'Phiên bản Build' : 'Build Versions'}</span>
                <strong className="stat-num">{builds.length}</strong>
                <span className="stat-sub">
                  {vi ? `${publishedBuilds} đang công khai` : `${publishedBuilds} published`}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">{vi ? 'Analytics Snapshots' : 'Analytics Snapshots'}</span>
                <strong className="stat-num">{snapshots.length}</strong>
                <span className="stat-sub">
                  {latestItch30d
                    ? `itch.io 30d (${latestItch30d.window_start_date}→${latestItch30d.window_end_date}): ${latestItch30d.views ?? 'N/A'} views, ${latestItch30d.downloads ?? 'N/A'} downloads`
                    : vi
                      ? 'Chưa có snapshot 30d'
                      : 'No 30d snapshot yet'}
                </span>
              </div>
            </section>

            {/* Section navigation */}
            <div className="tabs admin-tabs" role="tablist">
              <button role="tab" type="button" aria-selected={tab === 'overview'} onClick={() => setTab('overview')}>
                {vi ? 'Tổng quan' : 'Overview'}
              </button>
              <button role="tab" type="button" aria-selected={tab === 'bugs'} onClick={() => setTab('bugs')}>
                {vi ? `Báo lỗi (${bugs.length})` : `Bug Reports (${bugs.length})`}
              </button>
              <button role="tab" type="button" aria-selected={tab === 'feedback'} onClick={() => setTab('feedback')}>
                {vi ? `Góp ý (${feedback.length})` : `Feedback (${feedback.length})`}
              </button>
              <button role="tab" type="button" aria-selected={tab === 'builds'} onClick={() => setTab('builds')}>
                {vi ? `Phiên bản Build (${builds.length})` : `Builds (${builds.length})`}
              </button>
              <button role="tab" type="button" aria-selected={tab === 'analytics'} onClick={() => setTab('analytics')}>
                {vi ? `Analytics (${snapshots.length})` : `Analytics (${snapshots.length})`}
              </button>
            </div>

            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
              <div className="admin-sections">
                <section className="form-card">
                  <h3>{vi ? 'Báo lỗi mới nhất' : 'Recent Bug Reports'}</h3>
                  {bugs.length === 0 ? (
                    <p className="muted-text">{vi ? 'Chưa có báo cáo lỗi nào.' : 'No bug reports submitted yet.'}</p>
                  ) : (
                    <div className="table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>{vi ? 'Tiêu đề' : 'Title'}</th>
                            <th>{vi ? 'Mức độ' : 'Severity'}</th>
                            <th>{vi ? 'Trạng thái' : 'Status'}</th>
                            <th>{vi ? 'Cập nhật trạng thái' : 'Update Status'}</th>
                            <th>{vi ? 'Thời gian' : 'Created'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bugs.slice(0, 5).map((b) => (
                            <tr key={b.id}>
                              <td>
                                <strong>{b.title}</strong>
                                <div className="muted-text small-text">{b.description}</div>
                              </td>
                              <td>
                                <span className={`pill sev-${b.severity}`}>{b.severity}</span>
                              </td>
                              <td>
                                <span className={`pill st-${b.status}`}>{b.status}</span>
                              </td>
                              <td>
                                <select
                                  aria-label={`Status for ${b.title}`}
                                  value={b.status}
                                  onChange={(e) => handleBugUpdate(b.id, { status: e.target.value as BugStatus })}
                                >
                                  {BUG_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="small-text">{new Date(b.created_at).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section className="form-card">
                  <h3>{vi ? 'Góp ý mới nhất' : 'Recent Feedback'}</h3>
                  {feedback.length === 0 ? (
                    <p className="muted-text">{vi ? 'Chưa có góp ý nào.' : 'No player feedback submitted yet.'}</p>
                  ) : (
                    <div className="table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>{vi ? 'Đánh giá' : 'Rating'}</th>
                            <th>{vi ? 'Chủ đề' : 'Category'}</th>
                            <th>{vi ? 'Nội dung' : 'Message'}</th>
                            <th>{vi ? 'Người gửi' : 'Player'}</th>
                            <th>{vi ? 'Thời gian' : 'Created'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {feedback.slice(0, 5).map((f) => (
                            <tr key={f.id}>
                              <td>
                                <strong className="star-text">{'★'.repeat(f.rating)}</strong> ({f.rating}/5)
                              </td>
                              <td>
                                <span className="pill">{f.category}</span>
                              </td>
                              <td>{f.message}</td>
                              <td className="small-text">
                                {f.player_name || '—'}
                                {f.player_email ? ` (${f.player_email})` : ''}
                              </td>
                              <td className="small-text">{new Date(f.created_at).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* BUG REPORTS TAB */}
            {tab === 'bugs' && (
              <section className="form-card">
                <div className="section-head">
                  <h3>{vi ? 'Quản lý Báo cáo lỗi (Bug Reports)' : 'Bug Reports Management'}</h3>
                  <label className="inline-filter">
                    {vi ? 'Lọc trạng thái:' : 'Filter status:'}
                    <select value={bugStatusFilter} onChange={(e) => setBugStatusFilter(e.target.value)}>
                      <option value="all">{vi ? 'Tất cả' : 'All'}</option>
                      {BUG_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {filteredBugs.length === 0 ? (
                  <p className="muted-text">{vi ? 'Không có báo lỗi nào khớp bộ lọc.' : 'No bug reports match the filter.'}</p>
                ) : (
                  <div className="table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>{vi ? 'Chi tiết lỗi' : 'Bug Details'}</th>
                          <th>{vi ? 'Phiên bản' : 'Build'}</th>
                          <th>{vi ? 'Mức độ' : 'Severity'}</th>
                          <th>{vi ? 'Trạng thái' : 'Status'}</th>
                          <th>{vi ? 'Người báo / Máy' : 'Reporter / Specs'}</th>
                          <th>{vi ? 'Tạo / Cập nhật' : 'Created / Updated'}</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBugs.map((b) => (
                          <tr key={b.id}>
                            <td>
                              <strong>{b.title}</strong>
                              <p className="small-text">{b.description}</p>
                              {b.steps_to_reproduce && (
                                <p className="small-text muted-text">
                                  <strong>{vi ? 'Bước tái hiện:' : 'Steps:'}</strong> {b.steps_to_reproduce}
                                </p>
                              )}
                            </td>
                            <td>
                              <select
                                aria-label={`Build for ${b.title}`}
                                value={b.build_id ?? ''}
                                onChange={(e) => handleBugUpdate(b.id, { build_id: e.target.value || null })}
                              >
                                <option value="">—</option>
                                {builds.map((bd) => (
                                  <option key={bd.id} value={bd.id}>
                                    {bd.version}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <select
                                aria-label={`Severity for ${b.title}`}
                                value={b.severity}
                                onChange={(e) => handleBugUpdate(b.id, { severity: e.target.value as BugSeverity })}
                              >
                                {BUG_SEVERITIES.map((sev) => (
                                  <option key={sev} value={sev}>
                                    {sev}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <select
                                aria-label={`Status for ${b.title}`}
                                value={b.status}
                                onChange={(e) => handleBugUpdate(b.id, { status: e.target.value as BugStatus })}
                              >
                                {BUG_STATUSES.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="small-text">
                              <div>{b.reporter_name || '—'}</div>
                              {b.reporter_email && <div className="muted-text">{b.reporter_email}</div>}
                              {b.system_info && <div className="muted-text">{b.system_info}</div>}
                            </td>
                            <td className="small-text">
                              <div>{new Date(b.created_at).toLocaleString()}</div>
                              <div className="muted-text">↻ {new Date(b.updated_at).toLocaleString()}</div>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn ghost btn-sm"
                                onClick={() => handleDeleteBug(b.id)}
                              >
                                {vi ? 'Xóa' : 'Delete'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {/* FEEDBACK TAB */}
            {tab === 'feedback' && (
              <section className="form-card">
                <div className="section-head">
                  <h3>{vi ? 'Danh sách Góp ý (Feedback)' : 'Player Feedback'}</h3>
                  <label className="inline-filter">
                    {vi ? 'Lọc chủ đề:' : 'Filter category:'}
                    <select value={feedbackCategoryFilter} onChange={(e) => setFeedbackCategoryFilter(e.target.value)}>
                      <option value="all">{vi ? 'Tất cả' : 'All'}</option>
                      {['general', 'gameplay', 'controls', 'visuals', 'audio', 'difficulty', 'other'].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {filteredFeedback.length === 0 ? (
                  <p className="muted-text">{vi ? 'Không có góp ý nào.' : 'No feedback entries found.'}</p>
                ) : (
                  <div className="table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>{vi ? 'Sao' : 'Rating'}</th>
                          <th>{vi ? 'Chủ đề' : 'Category'}</th>
                          <th>{vi ? 'Nội dung góp ý' : 'Message'}</th>
                          <th>{vi ? 'Bản Build' : 'Build'}</th>
                          <th>{vi ? 'Người gửi' : 'Player'}</th>
                          <th>{vi ? 'Thời gian' : 'Submitted'}</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFeedback.map((f) => (
                          <tr key={f.id}>
                            <td>
                              <strong className="star-text">{'★'.repeat(f.rating)}</strong> ({f.rating}/5)
                            </td>
                            <td>
                              <span className="pill">{f.category}</span>
                            </td>
                            <td>{f.message}</td>
                            <td>{buildLabel(f.build_id)}</td>
                            <td className="small-text">
                              <div>{f.player_name || '—'}</div>
                              {f.player_email && <div className="muted-text">{f.player_email}</div>}
                            </td>
                            <td className="small-text">{new Date(f.created_at).toLocaleString()}</td>
                            <td>
                              <button
                                type="button"
                                className="btn ghost btn-sm"
                                onClick={() => handleDeleteFeedback(f.id)}
                              >
                                {vi ? 'Xóa' : 'Delete'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {/* BUILDS TAB */}
            {tab === 'builds' && (
              <div className="admin-sections">
                <section className="form-card">
                  <h3>
                    {editingBuild
                      ? vi
                        ? `Chỉnh sửa Build: ${editingBuild.version}`
                        : `Edit Build: ${editingBuild.version}`
                      : vi
                        ? 'Thêm phiên bản Build mới'
                        : 'Add New Build Version'}
                  </h3>
                  <form onSubmit={handleSaveBuild} key={editingBuild?.id ?? 'new'}>
                    <div className="grid2">
                      <label>
                        {vi ? 'Mã phiên bản (Version) *' : 'Version *'}
                        <input
                          name="version"
                          required
                          maxLength={40}
                          defaultValue={editingBuild?.version ?? ''}
                          placeholder="0.1.0-beta"
                        />
                      </label>
                      <label>
                        {vi ? 'Tiêu đề bản Build' : 'Build Title'}
                        <input
                          name="title"
                          maxLength={120}
                          defaultValue={editingBuild?.title ?? ''}
                          placeholder="Public Beta Build (2026-10-15)"
                        />
                      </label>
                    </div>
                    <div className="grid2">
                      <label>
                        {vi ? 'Link tải (itch.io URL)' : 'Download URL (itch.io)'}
                        <input
                          name="download_url"
                          type="url"
                          defaultValue={editingBuild?.download_url ?? 'https://besofuls.itch.io/off-flame-together'}
                          placeholder="https://besofuls.itch.io/off-flame-together"
                        />
                      </label>
                      <label>
                        {vi ? 'Ngày phát hành' : 'Release Date'}
                        <input name="released_at" type="date" defaultValue={editingBuild?.released_at ?? '2026-10-15'} />
                      </label>
                    </div>
                    <label>
                      {vi ? 'Ghi chú phát hành (Release Notes)' : 'Release Notes'}
                      <textarea
                        name="release_notes"
                        rows={3}
                        maxLength={5000}
                        defaultValue={editingBuild?.release_notes ?? ''}
                        placeholder={
                          vi
                            ? 'Mô tả các thay đổi trong bản build (VD: OffFlameTogether_Build_20261015.zip)...'
                            : 'Describe what is included in this build...'
                        }
                      />
                    </label>
                    <label className="checkbox-row">
                      <input
                        name="is_published"
                        type="checkbox"
                        defaultChecked={editingBuild ? editingBuild.is_published : true}
                      />
                      <span>
                        {vi
                          ? 'Công khai (is_published = true) — cho phép khách chọn phiên bản này khi gửi góp ý/báo lỗi'
                          : 'Published (is_published = true) — visible to public visitors on the feedback form'}
                      </span>
                    </label>
                    <div className="cta-row">
                      <button className="btn primary" type="submit">
                        {editingBuild ? (vi ? 'Lưu thay đổi' : 'Save changes') : vi ? 'Tạo bản Build' : 'Create build'}
                      </button>
                      {editingBuild && (
                        <button type="button" className="btn ghost" onClick={() => setEditingBuild(null)}>
                          {vi ? 'Hủy' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </form>
                </section>

                <section className="form-card">
                  <h3>{vi ? 'Danh sách các bản Build' : 'Existing Build Versions'}</h3>
                  {builds.length === 0 ? (
                    <p className="muted-text">{vi ? 'Chưa có bản build nào.' : 'No build versions recorded yet.'}</p>
                  ) : (
                    <div className="table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>{vi ? 'Phiên bản' : 'Version'}</th>
                            <th>{vi ? 'Tiêu đề & Ghi chú' : 'Title & Release Notes'}</th>
                            <th>{vi ? 'Ngày phát hành' : 'Released'}</th>
                            <th>{vi ? 'Trạng thái' : 'Status'}</th>
                            <th>{vi ? 'Thao tác' : 'Actions'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {builds.map((b) => (
                            <tr key={b.id}>
                              <td>
                                <strong>{b.version}</strong>
                                {b.download_url && (
                                  <div>
                                    <a href={b.download_url} target="_blank" rel="noopener noreferrer" className="small-text">
                                      itch.io ↗
                                    </a>
                                  </div>
                                )}
                              </td>
                              <td>
                                <div>{b.title || '—'}</div>
                                {b.release_notes && <div className="small-text muted-text">{b.release_notes}</div>}
                              </td>
                              <td className="small-text">{b.released_at || '—'}</td>
                              <td>
                                <span className={`pill ${b.is_published ? 'st-resolved' : 'st-closed'}`}>
                                  {b.is_published ? (vi ? 'Công khai' : 'Published') : vi ? 'Nháp' : 'Draft'}
                                </span>
                              </td>
                              <td>
                                <div className="row-actions">
                                  <button type="button" className="btn ghost btn-sm" onClick={() => setEditingBuild(b)}>
                                    {vi ? 'Sửa' : 'Edit'}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn ghost btn-sm"
                                    onClick={() => handleToggleBuildPublished(b)}
                                  >
                                    {b.is_published ? (vi ? 'Ẩn' : 'Unpublish') : vi ? 'Công khai' : 'Publish'}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn ghost btn-sm"
                                    onClick={() => handleDeleteBuild(b.id)}
                                  >
                                    {vi ? 'Xóa' : 'Delete'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* ANALYTICS TAB */}
            {tab === 'analytics' && (
              <div className="admin-sections">
                <div className="notice ok">
                  <strong>
                    {vi
                      ? 'Nguyên tắc toàn vẹn dữ liệu Analytics:'
                      : 'Analytics Data Integrity Policy:'}
                  </strong>
                  <p>
                    {vi
                      ? 'Mỗi snapshot được gắn với nguồn, loại cửa sổ thời gian (7d, 30d, all_time, custom) và ngày bắt đầu – kết thúc tường minh. Các số liệu 7 ngày và 30 ngày luôn tách riêng từng dòng, tuyệt đối không cộng gộp. Dữ liệu seed từ itch.io được gắn nhãn rõ ràng là "imported_itch_historical".'
                      : 'Every snapshot records an explicit source, window type (7d, 30d, all_time, custom), start date, and end date. 7-day and 30-day metrics are always stored as separate rows and never combined. Seeded itch.io figures are explicitly labeled as "imported_itch_historical".'}
                  </p>
                </div>

                {snapshots.map((s) => {
                  const refs = s.traffic_referrers ?? []
                  const refTotal = refs.reduce((acc, r) => acc + r.views, 0)
                  return (
                    <section className="form-card" key={s.id}>
                      <div className="section-head">
                        <div>
                          <span className="pill">{s.source}</span>{' '}
                          <span className="pill sev-medium">
                            {s.window_type} ({s.window_days} {vi ? 'ngày' : 'days'}: {s.window_start_date} →{' '}
                            {s.window_end_date})
                          </span>{' '}
                          <span
                            className={`pill ${
                              s.data_origin === 'imported_itch_historical' ? 'origin-seed' : 'st-in_progress'
                            }`}
                          >
                            {s.data_origin === 'imported_itch_historical'
                              ? vi
                                ? 'DỮ LIỆU LỊCH SỬ IMPORT TỪ ITCH.IO (ĐÃ XÁC MINH)'
                                : 'IMPORTED HISTORICAL ANALYTICS (VERIFIED ITCH.IO)'
                              : vi
                                ? 'Ghi nhận thủ công'
                                : 'Manual Entry'}
                          </span>
                        </div>
                        <div className="row-actions">
                          <span className="small-text muted-text" style={{ alignSelf: 'center' }}>
                            {vi ? 'Ngày chụp:' : 'Captured on:'} {s.captured_on}
                          </span>
                          <button
                            type="button"
                            className="btn ghost btn-sm"
                            onClick={() => setEditingSnapshot(editingSnapshot?.id === s.id ? null : s)}
                          >
                            {editingSnapshot?.id === s.id ? (vi ? 'Đóng' : 'Close') : vi ? 'Sửa số liệu' : 'Edit numbers'}
                          </button>
                          <button
                            type="button"
                            className="btn ghost btn-sm"
                            onClick={() => handleDeleteSnapshot(s.id)}
                          >
                            {vi ? 'Xóa' : 'Delete'}
                          </button>
                        </div>
                      </div>

                      {editingSnapshot?.id === s.id && (
                        <form className="inline-edit-snap" onSubmit={(e) => handleUpdateSnapshot(e, s.id)}>
                          <h4>{vi ? 'Cập nhật số liệu cho snapshot này:' : 'Update metrics for this snapshot:'}</h4>
                          <div className="grid2">
                            <label>
                              Views
                              <input name="views" type="number" min={0} defaultValue={s.views ?? ''} />
                            </label>
                            <label>
                              Downloads
                              <input name="downloads" type="number" min={0} defaultValue={s.downloads ?? ''} />
                            </label>
                          </div>
                          <div className="grid2">
                            <label>
                              Unique Views ({vi ? 'để trống nếu không có' : 'blank if unavailable'})
                              <input name="unique_views" type="number" min={0} defaultValue={s.unique_views ?? ''} />
                            </label>
                            <label>
                              {vi ? 'Ngày ghi nhận (captured_on)' : 'Captured on'}
                              <input name="captured_on" type="date" required defaultValue={s.captured_on} />
                            </label>
                          </div>
                          <label>
                            {vi ? 'Ghi chú' : 'Notes'}
                            <textarea name="notes" rows={2} maxLength={1000} defaultValue={s.notes ?? ''} />
                          </label>
                          <div className="cta-row">
                            <button type="submit" className="btn primary btn-sm">
                              {vi ? 'Lưu thay đổi' : 'Save changes'}
                            </button>
                            <button type="button" className="btn ghost btn-sm" onClick={() => setEditingSnapshot(null)}>
                              {vi ? 'Hủy' : 'Cancel'}
                            </button>
                          </div>
                        </form>
                      )}

                      <div className="stat-grid snapshot-metrics">
                        <div className="stat-card">
                          <span className="stat-label">Views</span>
                          <strong className="stat-num">{s.views ?? 'N/A'}</strong>
                        </div>
                        <div className="stat-card">
                          <span className="stat-label">Unique Views</span>
                          <strong className="stat-num">{s.unique_views ?? 'N/A'}</strong>
                          <span className="stat-sub">
                            {s.unique_views === null
                              ? vi
                                ? 'itch.io không hiển thị chỉ số này'
                                : 'Not reported by itch.io'
                              : ''}
                          </span>
                        </div>
                        <div className="stat-card">
                          <span className="stat-label">Downloads</span>
                          <strong className="stat-num">{s.downloads ?? 'N/A'}</strong>
                        </div>
                        <div className="stat-card">
                          <span className="stat-label">
                            {vi ? 'Tổng lượt từ Referrers đã ghi' : 'Listed Referrer Visits'}
                          </span>
                          <strong className="stat-num">{refTotal}</strong>
                          <span className="stat-sub">
                            {refs.length} {vi ? 'nguồn truy cập' : 'referrers'}
                          </span>
                        </div>
                      </div>

                      {s.notes && (
                        <p className="small-text muted-text">
                          <strong>{vi ? 'Ghi chú:' : 'Notes:'}</strong> {s.notes}
                        </p>
                      )}

                      <h4>{vi ? 'Nguồn truy cập (Traffic Referrers) trong cùng cửa sổ' : 'Traffic Referrers in this window'}</h4>
                      {refs.length === 0 ? (
                        <p className="muted-text small-text">
                          {vi ? 'Chưa có referrer nào cho snapshot này.' : 'No referrers recorded for this snapshot.'}
                        </p>
                      ) : (
                        <div className="table-wrap">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Referrer URL / Source</th>
                                <th>Visits</th>
                                <th style={{ width: 40 }}></th>
                              </tr>
                            </thead>
                            <tbody>
                              {refs
                                .slice()
                                .sort((a, b) => b.views - a.views)
                                .map((r) => (
                                  <tr key={r.id}>
                                    <td>{r.referrer}</td>
                                    <td>
                                      <strong>{r.views}</strong>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                      <button
                                        type="button"
                                        className="btn ghost btn-sm"
                                        title={vi ? 'Xóa nguồn này' : 'Remove this referrer'}
                                        onClick={() => handleDeleteReferrer(r.id)}
                                      >
                                        ✕
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <form className="inline-add-ref" onSubmit={(e) => handleAddReferrer(e, s.id)}>
                        <input
                          name="referrer"
                          required
                          maxLength={200}
                          placeholder={vi ? 'Thêm nguồn (VD: https://itch.io/...)' : 'Add referrer URL/source'}
                        />
                        <input
                          name="views"
                          type="number"
                          min={0}
                          required
                          placeholder={vi ? 'Số lượt' : 'Visits'}
                        />
                        <button type="submit" className="btn ghost btn-sm">
                          {vi ? '+ Thêm Referrer' : '+ Add Referrer'}
                        </button>
                      </form>
                    </section>
                  )
                })}

                <section className="form-card">
                  <h3>{vi ? 'Ghi nhận Analytics Snapshot mới' : 'Record New Analytics Snapshot'}</h3>
                  <form onSubmit={handleCreateSnapshot}>
                    <div className="grid2">
                      <label>
                        {vi ? 'Nguồn (Source) *' : 'Source *'}
                        <select name="source" defaultValue="itch.io">
                          <option value="itch.io">itch.io</option>
                          <option value="landing_page">landing_page</option>
                        </select>
                      </label>
                      <label>
                        {vi ? 'Loại cửa sổ (Window Type) *' : 'Window Type *'}
                        <select name="window_type" defaultValue="7d">
                          <option value="7d">{vi ? '7d (Đúng 7 ngày)' : '7d (Exactly 7 days)'}</option>
                          <option value="30d">{vi ? '30d (Đúng 30 ngày)' : '30d (Exactly 30 days)'}</option>
                          <option value="all_time">all_time</option>
                          <option value="custom">custom</option>
                        </select>
                      </label>
                    </div>
                    <div className="grid2">
                      <label>
                        {vi ? 'Ngày bắt đầu cửa sổ (window_start_date) *' : 'Window Start Date *'}
                        <input name="window_start_date" type="date" required defaultValue="2026-10-17" />
                      </label>
                      <label>
                        {vi ? 'Ngày kết thúc cửa sổ (window_end_date) *' : 'Window End Date *'}
                        <input name="window_end_date" type="date" required defaultValue="2026-10-23" />
                      </label>
                    </div>
                    <div className="grid2">
                      <label>
                        {vi ? 'Ngày ghi nhận (captured_on) *' : 'Captured On *'}
                        <input name="captured_on" type="date" required defaultValue="2026-10-23" />
                      </label>
                      <label>
                        {vi ? 'Nguồn gốc dữ liệu (data_origin) *' : 'Data Origin *'}
                        <select name="data_origin" defaultValue="manual_entry">
                          <option value="manual_entry">manual_entry</option>
                          <option value="imported_itch_historical">imported_itch_historical</option>
                        </select>
                      </label>
                    </div>
                    <div className="grid2">
                      <label>
                        Views
                        <input name="views" type="number" min={0} placeholder="Để trống nếu không có" />
                      </label>
                      <label>
                        Unique Views
                        <input name="unique_views" type="number" min={0} placeholder="Để trống nếu không có" />
                      </label>
                    </div>
                    <label>
                      Downloads
                      <input name="downloads" type="number" min={0} placeholder="Để trống nếu không có" />
                    </label>
                    <label>
                      {vi ? 'Ghi chú' : 'Notes'}
                      <textarea name="notes" rows={2} maxLength={1000} />
                    </label>
                    <button type="submit" className="btn primary">
                      {vi ? 'Lưu Snapshot' : 'Save Snapshot'}
                    </button>
                  </form>
                </section>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
