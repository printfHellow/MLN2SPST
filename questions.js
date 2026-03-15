// ============================================
// NGÂN HÀNG CÂU HỎI - Thêm câu hỏi ở đây!
// ============================================
// Mỗi câu hỏi có dạng:
// { question: "Nội dung câu hỏi?", options: ["A", "B", "C", "D"], correct: 0 }
// correct: chỉ số đáp án đúng (0 = A, 1 = B, 2 = C, 3 = D)
//
// Bạn có thể thêm bao nhiêu câu hỏi tùy thích.
// Game sẽ tự động chọn ngẫu nhiên mỗi lần chơi.
// ============================================

const QUESTION_POOL = [
    { question: "Theo C. Mác, điều kiện tiên quyết nào để sức lao động có thể trở thành hàng hóa?", options: ["Sự xuất hiện của thị trường chứng khoán và vốn.", "Người lao động được tự do về thân thể và không có tư liệu sản xuất.", "Người lao động có trình độ kỹ thuật và kỹ năng chuyên môn cao.", "Sản xuất hàng hóa đạt đến trình độ xã hội hóa cao."], correct: 1 },
    { question: "Giá trị của hàng hóa sức lao động được đo lường gián tiếp thông qua yếu tố nào?", options: ["Lượng giá trị các tư liệu sinh hoạt cần thiết để tái sản xuất sức lao động", "Tổng lợi nhuận mà nhà tư bản thu được sau một chu kỳ sản xuất.", "Số lượng máy móc mà người công nhân vận hành.", "Năng suất lao động trung bình của toàn xã hội."], correct: 0 },
    { question: "Tích lũy tư bản là gì?", options: ["Sự tiêu dùng toàn bộ giá trị thặng dư của nhà tư bản", "Sự chuyển hóa một phần giá trị thặng dư thành tư bản phụ thêm", "Sự mở rộng thị trường tiêu thụ hàng hóa", "Sự gia tăng tiền lương cho người lao động"], correct: 1 },
    { question: "Nguồn gốc duy nhất của tích lũy tư bản là gì?", options: ["Lao động sống", "Tư bản bất biến", "Giá trị thặng dư", "Tiền công của công nhân"], correct: 2 },
    { question: "Nhân tố nào sau đây ảnh hưởng đến quy mô tích lũy tư bản?", options: ["Số lượng doanh nghiệp trong nền kinh tế", "Trình độ khai thác sức lao động", "Mức sống của toàn xã hội", "Chính sách phúc lợi xã hội"], correct: 1 },
    { question: "Cấu tạo hữu cơ của tư bản là tỷ lệ giữa:", options: ["Tư bản cố định và tư bản lưu động", "Tư bản sử dụng và tư bản tiêu dùng", "Tư bản bất biến (c) và tư bản khả biến (v)", "Giá trị thặng dư và tiền công"], correct: 2 },
    { question: "Tập trung tư bản là gì?", options: ["Tăng quy mô tư bản cá biệt bằng cách tư bản hóa giá trị thặng dư", "Hợp nhất nhiều tư bản cá biệt thành một tư bản lớn hơn", "Tăng năng suất lao động xã hội", "Giảm chi phí sản xuất"], correct: 1 },

];

// Dialogue cho mỗi giai đoạn boss quiz
const BOSS_DIALOGUES = [
    "Boss kiến thức đầu tiên! Trả lời đúng để đuổi nó đi.",
    "Boss thứ hai xuất hiện! Hãy trả lời chính xác.",
    "Boss thứ ba! Đừng để sai nhé.",
    "Boss thứ tư! Câu hỏi cuối trước khi nó biến đổi."
];

// Hàm xáo trộn mảng (Fisher-Yates shuffle)
function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Tạo danh sách câu hỏi ngẫu nhiên cho 1 ván chơi (4 giai đoạn quiz)
function generateQuizQuestions() {
    const shuffled = shuffleArray(QUESTION_POOL);
    const selected = shuffled.slice(0, 4);
    return selected.map((q, idx) => ({
        dialogue: BOSS_DIALOGUES[idx] || `Boss giai đoạn ${idx + 1}!`,
        question: q.question,
        options: q.options,
        correct: q.correct
    }));
}
