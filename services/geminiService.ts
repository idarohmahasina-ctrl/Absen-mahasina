
import { GoogleGenAI } from "@google/genai";
import { AttendanceRecord } from "../types";

export const getAttendanceInsights = async (records: AttendanceRecord[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const context = records.map(r => ({
    nama: r.userName,
    waktu: new Date(r.timestamp).toLocaleString('id-ID'),
    tipe: r.type === 'In' ? 'Masuk' : 'Pulang',
    status: r.status,
    laporan: r.note || 'Tidak ada keterangan'
  }));

  const prompt = `
    Anda adalah asisten AI untuk sistem "Smart Report Mahasina". 
    Analisis data laporan berikut: ${JSON.stringify(context)}.
    Berikan laporan ringkas dalam Bahasa Indonesia:
    1. Statistik tingkat kedisiplinan (Hadir vs Keterlambatan/Izin).
    2. Ringkasan aktivitas menonjol dari laporan yang masuk.
    3. Rekomendasi untuk meningkatkan kualitas kedisiplinan di lingkungan Mahasina.
    Gunakan gaya bahasa yang formal, santun, dan profesional. Format dalam Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf, sistem AI Smart Report sedang tidak dapat menjangkau data saat ini.";
  }
};
