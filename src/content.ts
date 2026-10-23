// All editable landing-page copy lives here.
export const ITCH_URL = (import.meta.env.VITE_ITCH_URL as string | undefined)?.trim() ?? ''

export const problem = {
  title: 'Cứu hỏa là việc của cả đội – nhưng ít ai được thử cảm giác đó.',
  body:
    'Phản xạ trước đám cháy, việc quản lý nước và việc chọn đám cháy nào dập trước thường chỉ được nói qua lý thuyết. Người chơi trẻ hiếm khi có một trải nghiệm ngắn, an toàn để hình dung những quyết định ấy.',
}

export const solution = {
  title: 'Một prototype ngắn, chơi offline ngay trên PC.',
  body:
    'Off Flame Together đặt bạn vào vai lính cứu hỏa với vòi nước trong tay. Không cần tài khoản hay kết nối mạng: tải bản beta, chơi, rồi gửi phản hồi để đội phát triển cải thiện.',
}

export type Feature = { id: string; title: string; text: string; img: string; alt: string }

// Only features that exist in the current prototype.
export const features: Feature[] = [
  {
    id: 'movement',
    title: 'Di chuyển',
    text: 'Điều khiển nhân vật lính cứu hỏa đi lại trong khu vực chơi để tiếp cận các đám cháy.',
    img: 'firefighter',
    alt: 'Nhân vật lính cứu hỏa cầm vòi nước trên đường phố trong game',
  },
  {
    id: 'hose',
    title: 'Vòi xịt nước',
    text: 'Xịt nước vào đám cháy bằng vòi. Lượng nước có giới hạn nên bạn phải xịt có chủ đích.',
    img: 'water-hose',
    alt: 'Tia nước xanh từ vòi của lính cứu hỏa hướng vào đám cháy',
  },
  {
    id: 'hidden-hp',
    title: 'Máu đám cháy ẩn',
    text: 'Mỗi đám cháy có “máu” riêng nhưng không hiện thanh máu. Bạn phải tự quan sát và xịt đến khi lửa tắt.',
    img: 'gameplay-house',
    alt: 'Các đám cháy trong phòng khách của ngôi nhà, không có thanh máu hiển thị',
  },
  {
    id: 'demo-map',
    title: 'Bản đồ demo',
    text: 'Bản beta có một bản đồ demo gồm khu phố và ngôi nhà để thử nghiệm toàn bộ cơ chế.',
    img: 'demo-map-truck',
    alt: 'Xe cứu hỏa trên đường phố của bản đồ demo',
  },
  {
    id: 'win-lose',
    title: 'Điều kiện thắng / thua',
    text: 'Mỗi lượt chơi có nhiệm vụ, đồng hồ đếm ngược và chỉ số thể trạng. Hoàn thành nhiệm vụ để thắng; hết giờ hoặc hết thể trạng là thua.',
    img: 'gameplay-victim',
    alt: 'Giao diện nhiệm vụ, đồng hồ đếm ngược, thể trạng và lượng nước trong game',
  },
]

export const gallery = [
  { img: 'gameplay-house', alt: 'Cảnh cháy trong nhà với giao diện nhiệm vụ', caption: 'Trong nhà' },
  { img: 'water-hose', alt: 'Dập lửa bằng vòi nước ngoài phố', caption: 'Ngoài phố' },
  { img: 'demo-map-truck', alt: 'Xe cứu hỏa trong bản đồ demo', caption: 'Xe cứu hỏa' },
  { img: 'gameplay-victim', alt: 'Cảnh gameplay với nạn nhân và giao diện', caption: 'Giao diện chơi' },
]

export type Member = { name: string; role: string; placeholder?: boolean }

// TODO(team): replace placeholders with real members before submission.
export const team: Member[] = [
  { name: 'Tên thành viên 1', role: 'Vai trò', placeholder: true },
  { name: 'Tên thành viên 2', role: 'Vai trò', placeholder: true },
  { name: 'Tên thành viên 3', role: 'Vai trò', placeholder: true },
  { name: 'Tên thành viên 4', role: 'Vai trò', placeholder: true },
]
