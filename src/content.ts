// All editable landing-page copy lives here, in Vietnamese (vi) and English (en).
export type Lang = 'vi' | 'en'

export const ITCH_URL = (import.meta.env.VITE_ITCH_URL as string | undefined)?.trim() ?? ''

export type Feature = { id: string; title: string; text: string; img: string; alt: string }
export type Member = { name: string; role: string; placeholder?: boolean }

export type Copy = {
  metaTitle: string
  metaDescription: string
  skip: string
  navLabel: string
  nav: { problem: string; features: string; screens: string; feedback: string; team: string }
  langSwitch: string
  itchButton: string
  itchMissing: string
  hero: { eyebrow: string; lede: string; feedbackCta: string; alt: string }
  problemKicker: string
  problem: { title: string; body: string }
  solutionKicker: string
  solution: { title: string; body: string }
  featuresKicker: string
  featuresTitle: string
  features: Feature[]
  screensKicker: string
  screensTitle: string
  gallery: { img: string; alt: string; caption: string }[]
  download: { kicker: string; title: string; text: string }
  feedback: { kicker: string; title: string; text: string }
  teamKicker: string
  teamTitle: string
  team: Member[]
  footer: string
  form: {
    tabsLabel: string
    tabFeedback: string
    tabBug: string
    successTitle: string
    successText: string
    sendMore: string
    name: string
    email: string
    rating: string
    star: (n: number) => string
    category: string
    categories: [string, string][]
    message: string
    bugTitle: string
    bugDescription: string
    bugSteps: string
    severity: string
    severities: [string, string][]
    system: string
    systemPlaceholder: string
    sending: string
    sendFeedback: string
    sendBug: string
    errNotConfigured: string
    errRating: string
    errSubmit: string
  }
}

// TODO(team): replace placeholders with real members before submission.
const viTeam: Member[] = [1, 2, 3, 4, 5, 6].map((n) => ({ name: `Tên thành viên ${n}`, role: 'Vai trò', placeholder: true }))
const enTeam: Member[] = [1, 2, 3, 4, 5, 6].map((n) => ({ name: `Team member ${n}`, role: 'Role', placeholder: true }))

// Only features that exist in the current prototype.
export const copy: Record<Lang, Copy> = {
  vi: {
    metaTitle: 'Off Flame Together – Game cứu hỏa offline cho PC (bản beta)',
    metaDescription:
      'Off Flame Together là prototype game cứu hỏa offline cho PC. Tải bản beta trên itch.io và gửi góp ý cho đội phát triển.',
    skip: 'Bỏ qua điều hướng',
    navLabel: 'Chính',
    nav: { problem: 'Bài toán', features: 'Tính năng', screens: 'Hình ảnh', feedback: 'Góp ý', team: 'Đội ngũ' },
    langSwitch: 'Chuyển sang tiếng Anh',
    itchButton: 'Tải bản beta trên itch.io',
    itchMissing: 'Link itch.io chưa được cấu hình',
    hero: {
      eyebrow: 'Prototype · Bản beta · Offline trên PC',
      lede: 'Game cứu hỏa chơi offline trên PC. Cầm vòi nước, dập lửa, hoàn thành nhiệm vụ trước khi hết giờ.',
      feedbackCta: 'Gửi góp ý',
      alt: 'Lính cứu hỏa xịt nước vào đám cháy trên phố',
    },
    problemKicker: 'Vấn đề',
    problem: {
      title: 'Cứu hỏa là việc của cả đội – nhưng ít ai được thử cảm giác đó.',
      body: 'Phản xạ trước đám cháy, việc quản lý nước và việc chọn đám cháy nào dập trước thường chỉ được nói qua lý thuyết. Người chơi trẻ hiếm khi có một trải nghiệm ngắn, an toàn để hình dung những quyết định ấy.',
    },
    solutionKicker: 'Giải pháp',
    solution: {
      title: 'Một prototype ngắn, chơi offline ngay trên PC.',
      body: 'Off Flame Together đặt bạn vào vai lính cứu hỏa với vòi nước trong tay. Không cần tài khoản hay kết nối mạng: tải bản beta, chơi, rồi gửi phản hồi để đội phát triển cải thiện.',
    },
    featuresKicker: 'Tính năng hiện có',
    featuresTitle: 'Những gì bản prototype làm được hôm nay',
    features: [
      { id: 'movement', title: 'Di chuyển', text: 'Điều khiển nhân vật lính cứu hỏa đi lại trong khu vực chơi để tiếp cận các đám cháy.', img: 'firefighter', alt: 'Nhân vật lính cứu hỏa cầm vòi nước trên đường phố trong game' },
      { id: 'hose', title: 'Vòi xịt nước', text: 'Xịt nước vào đám cháy bằng vòi. Lượng nước có giới hạn nên bạn phải xịt có chủ đích.', img: 'water-hose', alt: 'Tia nước xanh từ vòi của lính cứu hỏa hướng vào đám cháy' },
      { id: 'hidden-hp', title: 'Máu đám cháy ẩn', text: 'Mỗi đám cháy có “máu” riêng nhưng không hiện thanh máu. Bạn phải tự quan sát và xịt đến khi lửa tắt.', img: 'gameplay-house', alt: 'Các đám cháy trong phòng khách của ngôi nhà, không có thanh máu hiển thị' },
      { id: 'demo-map', title: 'Bản đồ demo', text: 'Bản beta có một bản đồ demo gồm khu phố và ngôi nhà để thử nghiệm toàn bộ cơ chế.', img: 'demo-map-truck', alt: 'Xe cứu hỏa trên đường phố của bản đồ demo' },
      { id: 'win-lose', title: 'Điều kiện thắng / thua', text: 'Mỗi lượt chơi có nhiệm vụ, đồng hồ đếm ngược và chỉ số thể trạng. Hoàn thành nhiệm vụ để thắng; hết giờ hoặc hết thể trạng là thua.', img: 'gameplay-victim', alt: 'Giao diện nhiệm vụ, đồng hồ đếm ngược, thể trạng và lượng nước trong game' },
    ],
    screensKicker: 'Hình ảnh',
    screensTitle: 'Ảnh chụp từ game',
    gallery: [
      { img: 'gameplay-house', alt: 'Cảnh cháy trong nhà với giao diện nhiệm vụ', caption: 'Trong nhà' },
      { img: 'water-hose', alt: 'Dập lửa bằng vòi nước ngoài phố', caption: 'Ngoài phố' },
      { img: 'demo-map-truck', alt: 'Xe cứu hỏa trong bản đồ demo', caption: 'Xe cứu hỏa' },
      { img: 'gameplay-victim', alt: 'Cảnh gameplay với nạn nhân và giao diện', caption: 'Giao diện chơi' },
    ],
    download: {
      kicker: 'Bản beta',
      title: 'Tải về và chơi thử',
      text: 'Phiên bản Windows, phát hành trên itch.io. Game chạy offline, không cần tạo tài khoản.',
    },
    feedback: {
      kicker: 'Phản hồi',
      title: 'Chơi xong, cho chúng tôi biết nhé',
      text: 'Mọi góp ý và báo lỗi đều được đội phát triển đọc. Tên và email là tùy chọn; chỉ đội quản trị mới xem được nội dung bạn gửi.',
    },
    teamKicker: 'Đội ngũ',
    teamTitle: 'Người làm ra Off Flame Together',
    team: viTeam,
    footer:
      'Off Flame Together · Dự án học thuật EXE201 · Game chạy offline, website này chỉ để phân phối bản beta và thu thập phản hồi.',
    form: {
      tabsLabel: 'Loại phản hồi',
      tabFeedback: 'Góp ý',
      tabBug: 'Báo lỗi',
      successTitle: 'Đã gửi – cảm ơn bạn!',
      successText: 'Phản hồi của bạn đã được lưu cho đội phát triển.',
      sendMore: 'Gửi thêm',
      name: 'Tên (không bắt buộc)',
      email: 'Email (không bắt buộc)',
      rating: 'Mức độ hài lòng *',
      star: (n) => `${n} sao`,
      category: 'Chủ đề',
      categories: [['general', 'Chung'], ['gameplay', 'Lối chơi'], ['controls', 'Điều khiển'], ['visuals', 'Đồ họa'], ['audio', 'Âm thanh'], ['difficulty', 'Độ khó'], ['other', 'Khác']],
      message: 'Góp ý của bạn *',
      bugTitle: 'Tiêu đề lỗi *',
      bugDescription: 'Mô tả lỗi *',
      bugSteps: 'Các bước tái hiện',
      severity: 'Mức độ',
      severities: [['low', 'Thấp'], ['medium', 'Trung bình'], ['high', 'Cao'], ['critical', 'Nghiêm trọng']],
      system: 'Cấu hình máy',
      systemPlaceholder: 'VD: Windows 11, GTX 1650, 16GB',
      sending: 'Đang gửi…',
      sendFeedback: 'Gửi góp ý',
      sendBug: 'Gửi báo lỗi',
      errNotConfigured: 'Hệ thống nhận phản hồi chưa được cấu hình. Vui lòng thử lại sau.',
      errRating: 'Vui lòng chọn số sao đánh giá.',
      errSubmit: 'Không gửi được. Hãy kiểm tra thông tin (email hợp lệ, nội dung không để trống) rồi thử lại.',
    },
  },
  en: {
    metaTitle: 'Off Flame Together – Offline firefighting game for PC (beta)',
    metaDescription:
      'Off Flame Together is an offline firefighting game prototype for PC. Download the beta on itch.io and send feedback to the dev team.',
    skip: 'Skip navigation',
    navLabel: 'Main',
    nav: { problem: 'Problem', features: 'Features', screens: 'Screenshots', feedback: 'Feedback', team: 'Team' },
    langSwitch: 'Switch to Vietnamese',
    itchButton: 'Download the beta on itch.io',
    itchMissing: 'itch.io link not configured',
    hero: {
      eyebrow: 'Prototype · Beta · Offline on PC',
      lede: 'An offline firefighting game for PC. Grab the hose, put out the fires and finish the mission before time runs out.',
      feedbackCta: 'Send feedback',
      alt: 'A firefighter spraying water at a fire on a city street',
    },
    problemKicker: 'Problem',
    problem: {
      title: 'Firefighting is teamwork – yet few people ever get to feel it.',
      body: 'Reacting to a fire, managing water and choosing which fire to fight first are usually only taught in theory. Young players rarely get a short, safe experience that lets them picture those decisions.',
    },
    solutionKicker: 'Solution',
    solution: {
      title: 'A short prototype you can play offline on your PC.',
      body: 'Off Flame Together puts you in a firefighter’s boots with a hose in your hands. No account and no internet needed: download the beta, play, then send feedback to help the team improve it.',
    },
    featuresKicker: 'Current features',
    featuresTitle: 'What the prototype can do today',
    features: [
      { id: 'movement', title: 'Movement', text: 'Control the firefighter and move around the play area to reach the fires.', img: 'firefighter', alt: 'The firefighter character holding a hose on a street in the game' },
      { id: 'hose', title: 'Water hose', text: 'Spray water at fires with the hose. Water is limited, so you have to spray with purpose.', img: 'water-hose', alt: 'A blue stream of water from the firefighter’s hose aimed at a fire' },
      { id: 'hidden-hp', title: 'Hidden fire HP', text: 'Every fire has its own “HP” but no health bar is shown. You have to watch and keep spraying until the flames die out.', img: 'gameplay-house', alt: 'Fires in a house living room, with no health bar displayed' },
      { id: 'demo-map', title: 'Demo map', text: 'The beta includes one demo map with a street and a house to try out every mechanic.', img: 'demo-map-truck', alt: 'A fire truck on a street in the demo map' },
      { id: 'win-lose', title: 'Win / lose conditions', text: 'Each run has a mission, a countdown timer and a condition meter. Complete the mission to win; run out of time or condition and you lose.', img: 'gameplay-victim', alt: 'In-game mission panel, countdown timer, condition and water meters' },
    ],
    screensKicker: 'Screenshots',
    screensTitle: 'Screenshots from the game',
    gallery: [
      { img: 'gameplay-house', alt: 'A house fire with the mission panel', caption: 'Indoors' },
      { img: 'water-hose', alt: 'Putting out a fire with the hose on the street', caption: 'On the street' },
      { img: 'demo-map-truck', alt: 'A fire truck in the demo map', caption: 'Fire truck' },
      { img: 'gameplay-victim', alt: 'Gameplay scene with a victim and the HUD', caption: 'In-game HUD' },
    ],
    download: {
      kicker: 'Beta',
      title: 'Download and try it',
      text: 'Windows build, released on itch.io. The game runs offline and needs no account.',
    },
    feedback: {
      kicker: 'Feedback',
      title: 'Played it? Tell us what you think',
      text: 'The dev team reads every piece of feedback and bug report. Name and email are optional; only the admin team can see what you submit.',
    },
    teamKicker: 'Team',
    teamTitle: 'The people behind Off Flame Together',
    team: enTeam,
    footer:
      'Off Flame Together · EXE201 academic project · The game runs offline; this website only distributes the beta and collects feedback.',
    form: {
      tabsLabel: 'Type of message',
      tabFeedback: 'Feedback',
      tabBug: 'Bug report',
      successTitle: 'Sent – thank you!',
      successText: 'Your message has been saved for the dev team.',
      sendMore: 'Send another',
      name: 'Name (optional)',
      email: 'Email (optional)',
      rating: 'How satisfied are you? *',
      star: (n) => `${n} star${n > 1 ? 's' : ''}`,
      category: 'Topic',
      categories: [['general', 'General'], ['gameplay', 'Gameplay'], ['controls', 'Controls'], ['visuals', 'Visuals'], ['audio', 'Audio'], ['difficulty', 'Difficulty'], ['other', 'Other']],
      message: 'Your feedback *',
      bugTitle: 'Bug title *',
      bugDescription: 'Describe the bug *',
      bugSteps: 'Steps to reproduce',
      severity: 'Severity',
      severities: [['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['critical', 'Critical']],
      system: 'System specs',
      systemPlaceholder: 'e.g. Windows 11, GTX 1650, 16GB',
      sending: 'Sending…',
      sendFeedback: 'Send feedback',
      sendBug: 'Send bug report',
      errNotConfigured: 'The feedback system is not configured yet. Please try again later.',
      errRating: 'Please choose a star rating.',
      errSubmit: 'Could not send. Check your input (valid email, required fields filled) and try again.',
    },
  },
}
