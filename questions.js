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
    // === TOÁN HỌC ===
    { question: "2 + 2 bằng mấy?", options: ["3", "4", "5", "6"], correct: 1 },
    { question: "5 × 6 bằng bao nhiêu?", options: ["25", "30", "35", "36"], correct: 1 },
    { question: "100 ÷ 4 bằng?", options: ["20", "25", "30", "50"], correct: 1 },
    { question: "Số nguyên tố nhỏ nhất là?", options: ["0", "1", "2", "3"], correct: 2 },
    { question: "√144 bằng bao nhiêu?", options: ["10", "11", "12", "14"], correct: 2 },
    { question: "3² + 4² bằng?", options: ["20", "25", "30", "49"], correct: 1 },

    // === ĐỊA LÝ ===
    { question: "Thủ đô Việt Nam là?", options: ["TP.HCM", "Hà Nội", "Đà Nẵng", "Huế"], correct: 1 },
    { question: "Sông dài nhất Việt Nam là?", options: ["Sông Hồng", "Sông Đồng Nai", "Sông Mê Kông", "Sông Đà"], correct: 2 },
    { question: "Đỉnh núi cao nhất Việt Nam là?", options: ["Fansipan", "Tây Côn Lĩnh", "Phu Si Lung", "Ngọc Linh"], correct: 0 },
    { question: "Việt Nam có bao nhiêu tỉnh thành?", options: ["61", "63", "64", "65"], correct: 1 },

    // === KHOA HỌC ===
    { question: "Hành tinh lớn nhất hệ Mặt Trời?", options: ["Trái Đất", "Sao Hỏa", "Sao Mộc", "Sao Kim"], correct: 2 },
    { question: "Nước có công thức hóa học là?", options: ["CO₂", "H₂SO₄", "H₂O", "NaCl"], correct: 2 },
    { question: "Ánh sáng Mặt Trời đến Trái Đất mất khoảng?", options: ["8 giây", "8 phút", "80 phút", "8 giờ"], correct: 1 },
    { question: "Nguyên tố hóa học nào ký hiệu là Fe?", options: ["Nhôm", "Đồng", "Sắt", "Kẽm"], correct: 2 },
    { question: "Khí nào chiếm nhiều nhất trong khí quyển?", options: ["Oxy", "Nitơ", "CO₂", "Hydro"], correct: 1 },
    { question: "DNA là viết tắt của?", options: ["Dinitro Acid", "Deoxyribonucleic Acid", "Dynamic Nuclear Acid", "Dual Nucleus Acid"], correct: 1 },

    // === LỊCH SỬ ===
    { question: "Việt Nam giành độc lập năm nào?", options: ["1944", "1945", "1946", "1954"], correct: 1 },
    { question: "Ai là vị vua đầu tiên triều Nguyễn?", options: ["Minh Mạng", "Gia Long", "Tự Đức", "Thiệu Trị"], correct: 1 },
    { question: "Chiến thắng Điện Biên Phủ diễn ra năm?", options: ["1953", "1954", "1955", "1956"], correct: 1 },

    // === VĂN HÓA CHUNG ===
    { question: "Quốc hoa của Việt Nam là hoa gì?", options: ["Hoa mai", "Hoa sen", "Hoa đào", "Hoa lan"], correct: 1 },
    { question: "Tiếng Việt thuộc ngữ hệ nào?", options: ["Hán-Tạng", "Nam Á", "Tai-Kadai", "Nam Đảo"], correct: 1 },
    { question: "1 thế kỷ bằng bao nhiêu năm?", options: ["10", "50", "100", "1000"], correct: 2 },
    { question: "Trái Đất quay quanh Mặt Trời mất bao lâu?", options: ["30 ngày", "365 ngày", "24 giờ", "7 ngày"], correct: 1 },
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
