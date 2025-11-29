import { Buffer } from "buffer";
import PDFParser from "pdf2json";

// Helper function to wrap the event-based parser in a Promise
export function parsePdfBuffer(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)();

    pdfParser.on("pdfParser_dataReady", () => {
      const rawText = pdfParser.getRawTextContent();
      resolve(rawText);
    });

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      console.error("PDF2JSON Error:", errData.parserError);
      reject(new Error(errData.parserError));
    });

    pdfParser.parseBuffer(buffer);
  });
}
