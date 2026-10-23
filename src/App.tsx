import FeedbackForm from './components/FeedbackForm'
import { ITCH_URL, features, gallery, problem, solution, team } from './content'

function Picture({ name, alt, eager = false }: { name: string; alt: string; eager?: boolean }) {
  return (
    <picture>
      <source srcSet={`/img/${name}.webp`} type="image/webp" />
      <img src={`/img/${name}.jpg`} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
    </picture>
  )
}

function ItchButton({ className = '' }: { className?: string }) {
  if (!ITCH_URL) {
    return (
      <span className={`btn disabled ${className}`} role="note">
        Link itch.io chưa được cấu hình
      </span>
    )
  }
  return (
    <a className={`btn primary ${className}`} href={ITCH_URL} target="_blank" rel="noopener noreferrer">
      Tải bản beta trên itch.io
    </a>
  )
}

export default function App() {
  return (
    <>
      <a className="skip" href="#main">
        Bỏ qua điều hướng
      </a>
      <header className="nav">
        <a className="brand" href="#top">
          Off Flame Together
        </a>
        <nav aria-label="Chính">
          <a href="#problem">Bài toán</a>
          <a href="#features">Tính năng</a>
          <a href="#screens">Hình ảnh</a>
          <a href="#feedback">Góp ý</a>
          <a href="#team">Đội ngũ</a>
        </nav>
        <ItchButton className="nav-cta" />
      </header>

      <main id="main">
        <section className="hero" id="top">
          <Picture name="water-hose" alt="Lính cứu hỏa xịt nước vào đám cháy trên phố" eager />
          <div className="hero-shade" />
          <div className="wrap hero-copy">
            <p className="eyebrow">Prototype · Bản beta · Offline trên PC</p>
            <h1>
              Off Flame
              <br />
              Together
            </h1>
            <p className="lede">
              Game cứu hỏa chơi offline trên PC. Cầm vòi nước, dập lửa, hoàn thành nhiệm vụ trước khi hết giờ.
            </p>
            <div className="cta-row">
              <ItchButton />
              <a className="btn ghost" href="#feedback">
                Gửi góp ý
              </a>
            </div>
          </div>
        </section>

        <section className="wrap split" id="problem">
          <div>
            <p className="kicker">Vấn đề</p>
            <h2>{problem.title}</h2>
            <p>{problem.body}</p>
          </div>
          <div className="solution">
            <p className="kicker">Giải pháp</p>
            <h2>{solution.title}</h2>
            <p>{solution.body}</p>
          </div>
        </section>

        <section className="features" id="features">
          <div className="wrap">
            <p className="kicker">Tính năng hiện có</p>
            <h2>Những gì bản prototype làm được hôm nay</h2>
          </div>
          {features.map((f, i) => (
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
          <p className="kicker">Hình ảnh</p>
          <h2>Ảnh chụp từ game</h2>
          <ul className="gallery">
            {gallery.map((g) => (
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
              <p className="kicker">Bản beta</p>
              <h2>Tải về và chơi thử</h2>
              <p>Phiên bản Windows, phát hành trên itch.io. Game chạy offline, không cần tạo tài khoản.</p>
            </div>
            <ItchButton />
          </div>
        </section>

        <section className="wrap split" id="feedback">
          <div>
            <p className="kicker">Phản hồi</p>
            <h2>Chơi xong, cho chúng tôi biết nhé</h2>
            <p>
              Mọi góp ý và báo lỗi đều được đội phát triển đọc. Tên và email là tùy chọn; chỉ đội quản trị mới xem được nội dung bạn gửi.
            </p>
          </div>
          <FeedbackForm />
        </section>

        <section className="wrap" id="team">
          <p className="kicker">Đội ngũ</p>
          <h2>Người làm ra Off Flame Together</h2>
          <ul className="team">
            {team.map((m) => (
              <li key={m.name} className={m.placeholder ? 'placeholder' : ''}>
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
        <div className="wrap">
          <p>Off Flame Together · Dự án học thuật EXE201 · Game chạy offline, website này chỉ để phân phối bản beta và thu thập phản hồi.</p>
        </div>
      </footer>
    </>
  )
}
