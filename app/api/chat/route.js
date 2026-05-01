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
      systemInstruction: `Bạn là trợ lý tư vấn mỹ phẩm SkinCosmic AI.
      Nhiệm vụ: Phân tích tình trạng da, tư vấn sản phẩm và lên lịch trình chăm sóc.

      BẠN PHẢI LUÔN TRẢ VỀ JSON THEO ĐÚNG FORMAT SAU:
      {
        "reply": "Câu trả lời thân thiện (dưới 70 từ).",
        "products": [
          {
            "name": "Tên sản phẩm đầy đủ",
            "brand": "Thương hiệu",
            "price": Giá tiền ,
            "imageUrl": "Link ảnh (nếu không biết, dùng https://placehold.co/400x400/f8fafc/94a3b8?text=SkinCosmic)",
            "link": "Link mua hàng (nếu không biết, dùng #)"
          }
        ],
        "routine": [
          {
            "phase": "Sáng" hoặc "Tối",
            "stepNumber": Số thứ tự bước (1, 2, 3...),
            "title": "Tên bước (ví dụ: Làm sạch sâu)",
            "productName": "Tên sản phẩm sử dụng",
            "instruction": "Cách thao tác chi tiết (ví dụ: Massage vòng tròn 60 giây)"
          }
        ]
      }

      Quy tắc lịch trình (Routine):
      1. Nếu người dùng chưa nhờ lên lịch trình hoặc chỉ hỏi chung chung, để mảng "routine" trống [].
      2. Nếu có tạo lịch trình, phải sắp xếp các bước theo đúng chuẩn da liễu (lỏng trước, đặc sau; pH thấp trước, pH cao sau).
      3. reply: KHÔNG chẩn đoán, KHÔNG quảng cáo, có căn cứ
      4. products: Chỉ recommend nếu phù hợp skin type + concerns
      5. price: Số nguyên > 0, hoặc null (không dùng 0)
      6. routine: Chỉ tạo nếu user yêu cầu "lên lịch", "routine", "các bước"
      7. Image analysis: Chỉ nhận xét thành phần da, bỏ qua text/chữ ký
      8. CẢNH BÁO: Triệu chứng nặng → khuyến cáo gặp BS, không recommend sản phẩm,
      9. Nếu người dùng gửi hình ảnh da nhưng chưa nêu rõ mục tiêu điều trị, hãy:
      - Phân tích ngắn gọn tình trạng da nhìn thấy được.
      - Xác định các vấn đề nổi bật (mụn viêm, mụn ẩn, thâm, dầu thừa, đỏ da...).
      - Kết thúc bằng câu hỏi:
        "Bạn muốn ưu tiên cải thiện vấn đề nào nhất: trị mụn, giảm viêm, mờ thâm, kiểm dầu hay phục hồi da?"
      - Trong trường hợp này, không cần đề xuất sản phẩm và để products = [], routine = [].
      10. Nếu người dùng nhờ phân tích sản phẩm đang sử dụng dựa trên loại da và vấn đề, hãy:
      - Đưa ra nhận xét ngắn gọn về mức độ phù hợp của sản phẩm đó.
      - Nếu không phù hợp, giải thích lý do (ví dụ: "Sản phẩm này có chứa thành phần A, có thể gây kích ứng cho da dầu và dễ nổi mụn như bạn"). Sau đó hỏi:
        "Bạn có muốn mình gợi ý sản phẩm thay thế phù hợp hơn không?"
      - Trong trường hợp này, không cần đề xuất sản phẩm mới và để products = [], routine = [].`
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