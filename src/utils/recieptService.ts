import PDFDocument from "pdfkit";
import cloudinary from "./cloudinary";
import { IReceiptData } from "../interfaces/IReceiptData";

export async function generateAndUploadReceipt(
  data: IReceiptData
): Promise<string> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const pdfChunks: Uint8Array[] = [];

    doc.on("data", (chunk) => pdfChunks.push(chunk));
    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(pdfChunks);

        const uploadResult = await new Promise<any>((res, rej) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "raw",
              folder: "auction_receipts",
              public_id: `receipt_${data.auctionId}_${Date.now()}`,
            },
            (error, result) => {
              if (error) rej(error);
              else res(result);
            }
          );
          uploadStream.end(pdfBuffer);
        });

        console.log("receipt uploaded", uploadResult.secure_url);
        resolve(uploadResult.secure_url);
      } catch (error) {
        console.log("failed to upload receipt", error);
        reject(new Error("receipt upload failed"));
      }
    });

    // HEADER
    doc.fontSize(22).text("Artisan Auctions", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(16).text("Official Transaction Receipt", { align: "center" });
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // horizontal divider
    doc.moveDown();

    // RECEIPT INFO
    doc.fontSize(12).text(`Receipt ID: ${data.receiptId}`);
    doc.text(`Date: ${new Date().toLocaleString()}`);
    doc.text(`Auction ID: ${data.auctionId}`);
    doc.moveDown();

    // ARTWORK SECTION
    doc.fontSize(14).text("Artwork Details", { underline: true });
    doc.moveDown(0.2);
    doc.fontSize(12).text(`Artwork Title: ${data.artworkTitle}`);
    doc.moveDown();

    // PARTICIPANTS
    doc.fontSize(14).text("Parties Involved", { underline: true });
    doc.moveDown(0.2);
    doc.fontSize(12).text(`Winner: ${data.winnerName} (${data.winnerEmail})`);
    doc.text(`Seller: ${data.sellerName} (${data.sellerEmail})`);
    doc.moveDown();

    // PAYMENT SUMMARY
    doc.fontSize(14).text("Payment Summary", { underline: true });
    doc.moveDown(0.2);
    doc.fontSize(12).text(`Winning Bid: ₹${data.WinningAmount.toFixed(2)}`);
    doc.text(`Platform Fee (10%): ₹${data.platformFee.toFixed(2)}`);
    doc.text(
      `Amount Transferred to Seller: ₹${data.amountToSeller.toFixed(2)}`
    );
    doc.moveDown();

    // FOOTER
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // horizontal divider
    doc.moveDown();
    doc.fontSize(10).text("Thank you for participating in Artisan Auctions!", {
      align: "center",
    });
    doc.end();
  });
}
