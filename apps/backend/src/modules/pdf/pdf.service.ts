import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private storageService: StorageService) {}

  async generatePdf(
    html: string,
    filename: string,
  ): Promise<{ fileUrl: string; fileKey: string }> {
    this.logger.log(`Generating PDF: ${filename}`);
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
      });

      const fileKey = `pdfs/${filename}`;
      const fileUrl = await this.storageService.uploadBuffer(
        Buffer.from(pdfBuffer),
        fileKey,
        'application/pdf',
      );

      return { fileUrl, fileKey };
    } finally {
      await browser.close();
    }
  }

  async getSignedDownloadUrl(fileKey: string): Promise<string> {
    return this.storageService.getSignedUrl(fileKey, 86400); // 24h
  }
}
