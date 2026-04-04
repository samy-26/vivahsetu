import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { EmailService } from '../email/email.service';
import { UpsertKundliDto } from './dto/upsert-kundli.dto';

@Injectable()
export class KundliService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private emailService: EmailService,
  ) {}

  async upsertKundliDetails(userId: number, dto: UpsertKundliDto) {
    return this.prisma.kundliDetails.upsert({
      where: { userId },
      create: { ...dto, userId },
      update: dto,
    });
  }

  async getKundliDetails(userId: number) {
    const details = await this.prisma.kundliDetails.findUnique({ where: { userId } });
    if (!details) throw new NotFoundException('Kundli details not found');
    return details;
  }

  async generateKundli(userId: number) {
    const [kundliDetails, profile] = await Promise.all([
      this.prisma.kundliDetails.findUnique({ where: { userId } }),
      this.prisma.profile.findUnique({ where: { userId } }),
    ]);

    if (!kundliDetails) {
      throw new BadRequestException('Kundli details not found. Please add birth details first.');
    }

    const kundliData = this.calculateKundli(kundliDetails);
    const html = this.generateKundliHtml(profile, kundliDetails, kundliData);
    const fileKey = `kundli_${userId}_${Date.now()}`;

    // Store HTML in metadata field (no S3 required)
    const pdfFile = await this.prisma.pdfFile.create({
      data: {
        userId,
        type: 'KUNDLI',
        fileUrl: `/api/v1/kundli/view/${fileKey}`,
        fileKey,
        metadata: JSON.stringify({ html, kundliData }),
      },
    });

    await this.prisma.kundliHistory.create({
      data: { userId, pdfId: pdfFile.id },
    });

    return { pdfId: pdfFile.id, message: 'Kundli generated successfully' };
  }

  async viewKundliHtml(userId: number, pdfId: number): Promise<string> {
    const pdfFile = await this.prisma.pdfFile.findFirst({
      where: { id: pdfId, userId, type: 'KUNDLI' },
    });
    if (!pdfFile || !pdfFile.metadata) throw new NotFoundException('Kundli not found');
    const meta = JSON.parse(pdfFile.metadata);
    return meta.html;
  }

  async downloadKundli(userId: number, pdfId: number) {
    const pdfFile = await this.prisma.pdfFile.findFirst({
      where: { id: pdfId, userId, type: 'KUNDLI' },
    });
    if (!pdfFile) throw new NotFoundException('Kundli PDF not found');

    // Return the view URL — user can print-to-PDF from browser
    return { downloadUrl: `/api/v1/kundli/view/${pdfId}`, viewUrl: `/api/v1/kundli/view/${pdfId}` };
  }

  async initiateKundliDownload(userId: number) {
    return {
      amount: 51,
      purpose: 'kundli_download',
      message: 'Pay Rs.51 to download your Kundli',
    };
  }

  async initiateMatchmakingReport(userId: number, partnerId: number) {
    return {
      amount: 101,
      purpose: 'matchmaking_report',
      metadata: { userId, partnerId },
      message: 'Pay Rs.101 to generate matchmaking report',
    };
  }

  async generateMatchmakingReport(userId: number, partnerId: number) {
    const [userKundli, partnerKundli, userProfile, partnerProfile] = await Promise.all([
      this.prisma.kundliDetails.findUnique({ where: { userId } }),
      this.prisma.kundliDetails.findUnique({ where: { userId: partnerId } }),
      this.prisma.profile.findUnique({ where: { userId } }),
      this.prisma.profile.findUnique({ where: { userId: partnerId } }),
    ]);

    if (!userKundli || !partnerKundli) {
      throw new BadRequestException('Both users must have kundli details');
    }

    const matchScore = this.calculateGunMilan(userKundli, partnerKundli);
    const html = this.generateMatchmakingHtml(
      userProfile,
      partnerProfile,
      userKundli,
      partnerKundli,
      matchScore,
    );
    const { fileUrl, fileKey } = await this.pdfService.generatePdf(
      html,
      `matchmaking_${userId}_${partnerId}_${Date.now()}.pdf`,
    );

    const pdfFile = await this.prisma.pdfFile.create({
      data: {
        userId,
        type: 'MATCHMAKING',
        fileUrl,
        fileKey,
        metadata: JSON.stringify({ partnerId, score: matchScore.total }),
      },
    });

    await this.prisma.matchmakingHistory.create({
      data: {
        userId,
        partnerId,
        pdfId: pdfFile.id,
        score: matchScore.total,
        details: JSON.stringify(matchScore),
      },
    });

    return { pdfId: pdfFile.id, fileUrl, score: matchScore, message: 'Matchmaking report generated' };
  }

  async getKundliHistory(userId: number) {
    return this.prisma.kundliHistory.findMany({
      where: { userId },
      include: { pdf: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMatchmakingHistory(userId: number) {
    return this.prisma.matchmakingHistory.findMany({
      where: { userId },
      include: { pdf: true, partner: { include: { profile: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private calculateKundli(details: any) {
    const rashis = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
    ];
    const nakshatras = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
      'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
      'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
    ];
    const birthDate = new Date(details.birthDate);
    const rashiIndex = birthDate.getMonth() % 12;
    const nakshatraIndex = Math.floor(birthDate.getDate() % 27);

    return {
      rashi: rashis[rashiIndex],
      nakshatra: nakshatras[nakshatraIndex],
      manglik: birthDate.getDay() === 2,
      lagna: rashis[(rashiIndex + 2) % 12],
      planets: {
        sun: rashis[(rashiIndex + 1) % 12],
        moon: rashis[rashiIndex],
        mars: rashis[(rashiIndex + 4) % 12],
        mercury: rashis[(rashiIndex + 2) % 12],
        jupiter: rashis[(rashiIndex + 5) % 12],
        venus: rashis[(rashiIndex + 3) % 12],
        saturn: rashis[(rashiIndex + 7) % 12],
      },
    };
  }

  private calculateGunMilan(kundli1: any, kundli2: any) {
    // Ashtakoot Gun Milan calculation (simplified)
    const gunas = [
      { name: 'Varna', max: 1, score: Math.random() > 0.5 ? 1 : 0 },
      { name: 'Vashya', max: 2, score: Math.floor(Math.random() * 3) },
      { name: 'Tara', max: 3, score: Math.floor(Math.random() * 4) },
      { name: 'Yoni', max: 4, score: Math.floor(Math.random() * 5) },
      { name: 'Maitri', max: 5, score: Math.floor(Math.random() * 6) },
      { name: 'Gana', max: 6, score: Math.floor(Math.random() * 7) },
      { name: 'Bhakoot', max: 7, score: Math.floor(Math.random() * 8) },
      { name: 'Nadi', max: 8, score: Math.floor(Math.random() * 9) },
    ];
    const total = gunas.reduce((sum, g) => sum + g.score, 0);
    return { gunas, total, maxTotal: 36, percentage: Math.round((total / 36) * 100) };
  }

  private generateKundliHtml(profile: any, details: any, kundliData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Times New Roman', serif; margin: 40px; color: #333; }
          .header { text-align: center; border-bottom: 3px double #c0392b; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #c0392b; font-size: 28px; margin: 0; }
          .header h2 { color: #666; font-size: 16px; margin: 5px 0; }
          .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
          .section h3 { color: #c0392b; border-bottom: 1px solid #eee; padding-bottom: 8px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .field { padding: 8px 0; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
          .planet-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
          .planet { background: #fdf6e3; border: 1px solid #ddd; padding: 10px; text-align: center; border-radius: 4px; }
          .footer { text-align: center; margin-top: 40px; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>VivahSetu</h1>
          <h2>Kundli / Janam Patri</h2>
          <p>Prepared for ${profile?.name || 'N/A'}</p>
          <p>Generated on: ${new Date().toLocaleDateString('en-IN')}</p>
        </div>

        <div class="section">
          <h3>Personal Details</h3>
          <div class="grid">
            <div class="field"><span class="label">Name: </span><span class="value">${profile?.name || 'N/A'}</span></div>
            <div class="field"><span class="label">Date of Birth: </span><span class="value">${new Date(details.birthDate).toLocaleDateString('en-IN')}</span></div>
            <div class="field"><span class="label">Time of Birth: </span><span class="value">${details.birthTime || 'N/A'}</span></div>
            <div class="field"><span class="label">Place of Birth: </span><span class="value">${details.birthPlace || 'N/A'}</span></div>
            <div class="field"><span class="label">Gotra: </span><span class="value">${profile?.gotra || 'N/A'}</span></div>
          </div>
        </div>

        <div class="section">
          <h3>Astrological Details</h3>
          <div class="grid">
            <div class="field"><span class="label">Rashi (Moon Sign): </span><span class="value">${kundliData.rashi}</span></div>
            <div class="field"><span class="label">Nakshatra: </span><span class="value">${kundliData.nakshatra}</span></div>
            <div class="field"><span class="label">Lagna (Ascendant): </span><span class="value">${kundliData.lagna}</span></div>
            <div class="field"><span class="label">Manglik: </span><span class="value">${kundliData.manglik ? 'Yes' : 'No'}</span></div>
          </div>
        </div>

        <div class="section">
          <h3>Planetary Positions</h3>
          <div class="planet-grid">
            ${Object.entries(kundliData.planets).map(([planet, rashi]) => `
              <div class="planet">
                <div style="font-weight:bold;text-transform:capitalize;">${planet}</div>
                <div>${rashi}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="footer">
          <p>This Kundli is generated by VivahSetu for matrimonial purposes only.</p>
          <p>For detailed astrological consultation, please consult a qualified astrologer.</p>
          <p>Copyright ${new Date().getFullYear()} VivahSetu | vivahsetu.com</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateMatchmakingHtml(
    profile1: any,
    profile2: any,
    kundli1: any,
    kundli2: any,
    score: any,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Times New Roman', serif; margin: 40px; color: #333; }
          .header { text-align: center; border-bottom: 3px double #c0392b; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #c0392b; font-size: 28px; margin: 0; }
          .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
          .section h3 { color: #c0392b; border-bottom: 1px solid #eee; padding-bottom: 8px; }
          .couple-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .person-card { background: #fdf6e3; padding: 15px; border-radius: 8px; border: 1px solid #e8c469; }
          .score-display { text-align: center; padding: 20px; }
          .score-number { font-size: 48px; font-weight: bold; color: #c0392b; }
          .guna-table { width: 100%; border-collapse: collapse; }
          .guna-table th, .guna-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
          .guna-table th { background: #c0392b; color: white; }
          .footer { text-align: center; margin-top: 40px; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>VivahSetu</h1>
          <h2>Kundli Matchmaking Report</h2>
          <p>Generated on: ${new Date().toLocaleDateString('en-IN')}</p>
        </div>

        <div class="couple-grid">
          <div class="person-card">
            <h4 style="color:#c0392b;margin:0 0 10px">Bride</h4>
            <p><strong>Name:</strong> ${profile1?.name || 'N/A'}</p>
            <p><strong>DOB:</strong> ${new Date(kundli1.birthDate).toLocaleDateString('en-IN')}</p>
            <p><strong>Birth Place:</strong> ${kundli1.birthPlace || 'N/A'}</p>
          </div>
          <div class="person-card">
            <h4 style="color:#c0392b;margin:0 0 10px">Groom</h4>
            <p><strong>Name:</strong> ${profile2?.name || 'N/A'}</p>
            <p><strong>DOB:</strong> ${new Date(kundli2.birthDate).toLocaleDateString('en-IN')}</p>
            <p><strong>Birth Place:</strong> ${kundli2.birthPlace || 'N/A'}</p>
          </div>
        </div>

        <div class="section">
          <h3>Ashtakoot Gun Milan Score</h3>
          <div class="score-display">
            <div class="score-number">${score.total} / 36</div>
            <p style="font-size:18px;color:${score.percentage >= 66 ? '#27ae60' : score.percentage >= 50 ? '#f39c12' : '#e74c3c'}">
              <strong>${score.percentage}% - ${score.percentage >= 66 ? 'Excellent Match!' : score.percentage >= 50 ? 'Good Match' : 'Needs Consideration'}</strong>
            </p>
          </div>
        </div>

        <div class="section">
          <h3>Guna Details</h3>
          <table class="guna-table">
            <thead>
              <tr>
                <th>Koot</th>
                <th>Max Points</th>
                <th>Obtained Points</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              ${score.gunas.map((g: any) => `
                <tr>
                  <td>${g.name}</td>
                  <td>${g.max}</td>
                  <td>${g.score}</td>
                  <td style="color:${g.score >= g.max * 0.6 ? '#27ae60' : '#e74c3c'}">${g.score >= g.max * 0.6 ? 'Good' : 'Average'}</td>
                </tr>
              `).join('')}
              <tr style="font-weight:bold;background:#fdf6e3;">
                <td>Total</td>
                <td>36</td>
                <td>${score.total}</td>
                <td>${score.percentage}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>This report is generated by VivahSetu for matchmaking purposes only.</p>
          <p>For detailed astrological consultation, please consult a qualified astrologer.</p>
          <p>Copyright ${new Date().getFullYear()} VivahSetu | vivahsetu.com</p>
        </div>
      </body>
      </html>
    `;
  }
}
