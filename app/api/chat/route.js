import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Khởi tạo SDK bằng API Key giấu trong file môi trường (.env.local)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const userMessage = body.message;
    const image = body.image;
    const profile = body.profile || {};

    const profileContext = `
      Hồ sơ da của người dùng:
      - Loại da: ${profile.skinType || 'Chưa cung cấp'}
      - Vấn đề ưu tiên: ${
        Array.isArray(profile.concerns) && profile.concerns.length > 0
          ? profile.concerns.join(', ')
          : 'Chưa cung cấp'
      }
      - Thành phần cần tránh/Dị ứng: ${profile.avoidIngredients || 'Không có'}
      - Ngân sách: ${profile.budget || 'Chưa cung cấp'}
      - Sản phẩm đang dùng: ${profile.currentProducts || 'Chưa cung cấp'}
    `;

    // 2. Cấu hình Model với System Instructions cực kỳ chặt chẽ
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
      },
      systemInstruction: `Bạn là chuyên gia tư vấn chăm sóc da SkinCosmic AI. Bạn có kiến thức chuyên sâu về da liễu, mỹ phẩm và luôn trả lời một cách tận tâm, thấu cảm.

      Nhiệm vụ: Phân tích tình trạng da, tư vấn sản phẩm, đánh giá sự phù hợp của mỹ phẩm và lên lịch trình chăm sóc da chuẩn y khoa.

      BẠN PHẢI LUÔN TRẢ VỀ DUY NHẤT MỘT CHUỖI JSON HỢP LỆ (KHÔNG bọc trong markdown \`\`\`json):
      {
        "reply": "Câu trả lời thân thiện, thấu hiểu và súc tích (dưới 80 từ).",
        "products": [
          {
            "name": "Tên sản phẩm đầy đủ",
            "brand": "Thương hiệu",
            "price": Số nguyên (ví dụ: 350000) hoặc null,
            "imageUrl": "Link ảnh (nếu không biết, dùng https://placehold.co/400x400/f8fafc/94a3b8?text=SkinCosmic)",
            "link": "Link mua hàng (nếu không biết, dùng #)"
          }
        ],
        "routine": [
          {
            "phase": "Sáng" hoặc "Tối",
            "stepNumber": Số thứ tự bước (1, 2, 3...),
            "title": "Tên bước (ví dụ: Làm sạch sâu, Phục hồi)",
            "productName": "Tên sản phẩm sử dụng",
            "instruction": "Cách thao tác chi tiết (ví dụ: Massage vòng tròn 60 giây)"
          }
        ]
      }

      QUY TẮC CỐT LÕI CẦN TUÂN THỦ NGHIÊM NGẶT:
      1. TỪ CHỐI KHÉO LÉO: Nếu người dùng hỏi các chủ đề KHÔNG liên quan đến chăm sóc da/làm đẹp, hãy từ chối nhẹ nhàng ở trường "reply" và để "products": [], "routine": [].
      2. KHÔNG CHẨN ĐOÁN Y TẾ: Nếu phát hiện da bị viêm nhiễm nặng, mụn bọc sưng đỏ diện rộng, BẮT BUỘC khuyên người dùng đi khám bác sĩ da liễu. KHÔNG tự ý gợi ý sản phẩm đặc trị mạnh.
      3. GỢI Ý SẢN PHẨM: Chỉ đề xuất ("products") nếu thực sự phù hợp với Loại da, Vấn đề ưu tiên và Ngân sách của người dùng. Tránh các thành phần người dùng bị dị ứng.
      4. XÂY DỰNG LỊCH TRÌNH (ROUTINE): TUYỆT ĐỐI KHÔNG tự động tạo lịch trình nếu người dùng không có từ khóa yêu cầu rõ ràng như "lên lịch", "các bước", "routine", "lộ trình". Việc đưa ra quá nhiều thông tin khi không được hỏi sẽ làm rối người dùng. Nếu không được yêu cầu, BẮT BUỘC để "routine": []. Nếu có yêu cầu, sắp xếp đúng nguyên tắc: Lỏng trước đặc sau, pH thấp đến cao. Tránh kết hợp các hoạt chất kỵ nhau (như Retinol + AHA/BHA nồng độ cao) trong cùng một buổi.
      5. PHÂN TÍCH HÌNH ẢNH: Nếu có ảnh, chỉ phân tích các vấn đề da nhìn thấy được. KHÔNG đọc chữ hay phân tích vật thể lạ trong ảnh.
      6. ĐỊNH HƯỚNG MỤC TIÊU: Nếu người dùng gửi ảnh/mô tả nhưng chưa rõ muốn cải thiện điều gì, hãy phân tích nhanh và kết thúc bằng câu hỏi gợi mở (VD: "Bạn muốn ưu tiên trị mụn hay mờ thâm?"). Khi đó, để "products": [], "routine": [].
      7. ĐÁNH GIÁ SẢN PHẨM: Nếu người dùng nhờ đánh giá sản phẩm họ đang dùng, hãy nhận xét dựa trên bảng thành phần và loại da của họ. Nếu không hợp, giải thích lý do và hỏi họ có muốn bạn gợi ý sản phẩm thay thế không.
      8. HƯỚNG DẪN SỬ DỤNG: Nếu người dùng hỏi bạn có thể làm gì hoặc cách dùng, hãy giới thiệu ngắn gọn các tính năng: (1) Điền Hồ sơ da bên trái để cá nhân hóa tư vấn, (2) Nhắn tin hỏi đáp về skincare, (3) Tải ảnh da lên để phân tích, (4) Nhấn nút "Routine" để AI lên lịch trình chăm sóc da chi tiết.`
    });

    const prompt = `${profileContext}

    Câu hỏi của người dùng: ${userMessage}

    Nếu có hình ảnh đính kèm, hãy phân tích tình trạng da nhìn thấy được và xác định các vấn đề da có khả năng gặp phải. Không chẩn đoán bệnh; hãy khuyến nghị gặp bác sĩ da liễu nếu tình trạng nghiêm trọng, đau rát hoặc không chắc chắn.`;

    const parts = [{ text: prompt }];

    if (image?.data && image?.mimeType) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType,
        },
      });
    }

    // 3. Gửi câu hỏi sang Google và chờ kết quả
    const result = await model.generateContent(parts);
    const rawText = result.response.text();

    // 4. Parse dữ liệu và trả về cho React Frontend
    const data = JSON.parse(rawText);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error("Lỗi xử lý API:", error);

    // Chuyển message lỗi về chữ thường để dễ kiểm tra từ khóa
    const errorMessage = error?.message?.toLowerCase() || "";
    
    // Kiểm tra xem lỗi có phải do hết quota (status 429 hoặc chứa từ khóa)
    const isQuotaError = error?.status === 429 || 
                         errorMessage.includes("429") || 
                         errorMessage.includes("quota");

    if (isQuotaError) {
      return new Response(
        JSON.stringify({
          reply: "Đã hết quota, vui lòng quay lại vào 1 ngày sau.",
          products: [],
          routine: [],
        }),
        {
          // Trả về HTTP 200 để frontend dễ dàng nhận JSON và in ra giao diện chat
          // (Hoặc bạn có thể để 429 nếu bên frontend đã cấu hình bắt lỗi !res.ok riêng)
          status: 200, 
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Xử lý các lỗi hệ thống khác (ví dụ: đứt cáp, Google sập, sai định dạng JSON...)
    return new Response(
      JSON.stringify({
        reply: "Rất tiếc, hệ thống đang bận. Bạn vui lòng thử lại sau nhé!",
        products: [],
        routine: [],
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}