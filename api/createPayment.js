// api/createPayment.js
import { Mayar } from "mayar-node";

// Pastikan kamu punya API_KEY di .env.local untuk keamanan
// Di Vercel, ini diatur di Environment Variables
const MAYAR_API_KEY = process.env.MAYAR_API_KEY;

// Inisialisasi Mayar SDK
const mayar = new Mayar({ apiKey: MAYAR_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { total, orderId, customer_email } = req.body;

    // Pastikan total tidak 0 dan ada orderId
    if (!total || !orderId) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Buat invoice di Mayar
    const result = await mayar.invoice.create({
      items: [
        {
          name: `Pembayaran Pesanan #${orderId}`,
          price: total,
          quantity: 1,
        },
      ],
      // Kamu bisa tambahkan info pelanggan lain jika diperlukan
      customer: {
        email: customer_email,
      },
    });

    if (result.success) {
      res.status(200).json({ payment: result });
    } else {
      res.status(500).json({ message: "Failed to create Mayar invoice" });
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
