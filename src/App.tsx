import { useEffect, useState } from 'react'
import AdminDashboard from './components/AdminDashboard'
import FeedbackForm from './components/FeedbackForm'
import { ITCH_URL } from './content'
import { useLang } from './i18n'

function isAdminLocation(): boolean {
  const h = window.location.hash.toLowerCase()
  const p = window.location.pathname.toLowerCase().replace(/\/+$/, '')
  return h === '#admin' || h.startsWith('#/admin') || p.endsWith('/admin')
}

function Picture({ name, alt, eager = false }: { name: string; alt: string; eager?: boolean }) {
  const base = import.meta.env.BASE_URL
  return (
    <picture>
      <source srcSet={`${base}img/${name}.webp`} type="image/webp" />
      <img src={`${base}img/${name}.jpg`} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
    </picture>
  )
}

function ItchButton({ className = '' }: { className?: string }) {
  const { t } = useLang()
  if (!ITCH_URL) {
    return (
      <span className={`btn disabled ${className}`} role="note">
        {t.itchMissing}
      </span>
    )
  }
  return (
    <a className={`btn primary ${className}`} href={ITCH_URL} target="_blank" rel="noopener noreferrer">
      {t.itchButton}
    </a>
  )
}

function LangToggle() {
  const { lang, t, toggle } = useLang()
  return (
    <button type="button" className="lang" onClick={toggle} aria-label={t.langSwitch} title={t.langSwitch}>
      <span className={lang === 'vi' ? 'on' : ''}>VI</span>
      <span className={lang === 'en' ? 'on' : ''}>EN</span>
    </button>
  )
}

export default function App() {
  const { t } = useLang()
  const [adminView, setAdminView] = useState<boolean>(isAdminLocation)

  useEffect(() => {
    const sync = () => setAdminView(isAdminLocation())
    window.addEventListener('hashchange', sync)
    window.addEventListener('popstate', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [])

  function exitAdmin() {
    const base = import.meta.env.BASE_URL || '/'
    if (window.location.pathname.toLowerCase().replace(/\/+$/, '').endsWith('/admin')) {
      window.history.pushState({}, '', base)
    } else {
      window.location.hash = ''
    }
    setAdminView(false)
  }

  if (adminView) {
    return <AdminDashboard onExit={exitAdmin} />
  }

  return (
    <>
      <a className="skip" href="#main">
        {t.skip}
      </a>
      <header className="nav">
        <a className="brand" href="#top">
          Off Flame Together
        </a>
        <nav aria-label={t.navLabel}>
          <a href="#problem">{t.nav.problem}</a>
          <a href="#features">{t.nav.features}</a>
          <a href="#screens">{t.nav.screens}</a>
          <a href="#feedback">{t.nav.feedback}</a>
          <a href="#team">{t.nav.team}</a>
        </nav>
        <LangToggle />
        <ItchButton className="nav-cta" />
      </header>

      <main id="main">
        <section className="hero" id="top">
          <Picture name="water-hose" alt={t.hero.alt} eager />
          <div className="hero-shade" />
          <div className="wrap hero-copy">
            <p className="eyebrow">{t.hero.eyebrow}</p>
            <h1>
              Off Flame
              <br />
              Together
            </h1>
            <p className="lede">{t.hero.lede}</p>
            <div className="cta-row">
              <ItchButton />
              <a className="btn ghost" href="#feedback">
                {t.hero.feedbackCta}
              </a>
            </div>
          </div>
        </section>

        <section className="wrap split" id="problem">
          <div>
            <p className="kicker">{t.problemKicker}</p>
            <h2>{t.problem.title}</h2>
            <p>{t.problem.body}</p>
          </div>
          <div className="solution">
            <p className="kicker">{t.solutionKicker}</p>
            <h2>{t.solution.title}</h2>
            <p>{t.solution.body}</p>
          </div>
        </section>

        <section className="features" id="features">
          <div className="wrap">
            <p className="kicker">{t.featuresKicker}</p>
            <h2>{t.featuresTitle}</h2>
          </div>
          {t.features.map((f, i) => (
            <article className={`feature wrap ${i % 2 ? 'flip' : ''}`} key={f.id}>
              <div className="feature-media">
                <Picture name={f.img} alt={f.alt} />
              </div>
              <div className="feature-text">
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="wrap" id="screens">
          <p className="kicker">{t.screensKicker}</p>
          <h2>{t.screensTitle}</h2>
          <ul className="gallery">
            {t.gallery.map((g) => (
              <li key={g.img}>
                <figure>
                  <Picture name={g.img} alt={g.alt} />
                  <figcaption>{g.caption}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>

        <section className="download" id="download">
          <div className="wrap download-inner">
            <div>
              <p className="kicker">{t.download.kicker}</p>
              <h2>{t.download.title}</h2>
              <p>{t.download.text}</p>
            </div>
            <ItchButton />
          </div>
        </section>

        <section className="wrap split" id="feedback">
          <div>
            <p className="kicker">{t.feedback.kicker}</p>
            <h2>{t.feedback.title}</h2>
            <p>{t.feedback.text}</p>
          </div>
          <FeedbackForm />
        </section>

        <section className="wrap" id="team">
          <p className="kicker">{t.teamKicker}</p>
          <h2>{t.teamTitle}</h2>
          <ul className="team">
            {t.team.map((m, i) => (
              <li key={i} className={m.placeholder ? 'placeholder' : ''}>
                <div className="avatar" aria-hidden="true">
                  {m.name.charAt(0)}
                </div>
                <strong>{m.name}</strong>
                <span>{m.role}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-row">
          <p>{t.footer}</p>
          <a href="#/admin" className="footer-admin-link">
            Admin Dashboard →
          </a>
        </div>
      </footer>
    </>
  )
}
