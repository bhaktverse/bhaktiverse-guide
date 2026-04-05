import React from 'react';
import {
  Document, Page, Text, View, StyleSheet, Font, Image
} from '@react-pdf/renderer';

// ─── FONT REGISTRATION (module-level) ─────────────────────────────
// Use Google Fonts direct TTF URLs for maximum compatibility
Font.register({
  family: 'NotoSans',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNr5TRA.woff2', fontWeight: 400, fontStyle: 'normal' },
    { src: 'https://fonts.gstatic.com/s/notosans/v36/o-0NIpQlx3QUlC5A4PNjXhFlY9A.woff2', fontWeight: 700, fontStyle: 'normal' },
    { src: 'https://fonts.gstatic.com/s/notosans/v36/o-0OIpQlx3QUlC5A4PNr4ARPQ_m87A.woff2', fontWeight: 400, fontStyle: 'italic' },
  ]
});

Font.register({
  family: 'NotoSansDevanagari',
  src: '/fonts/NotoSansDevanagari-Regular.ttf',
  fontWeight: 400,
});

// Disable hyphenation — it causes crashes with non-Latin scripts
Font.registerHyphenationCallback((word) => [word]);

// ─── COLORS ───────────────────────────────────────────────────────
const C = {
  primary: '#8B0000',
  gold: '#C9A84C',
  cream: '#FDF8F0',
  dark: '#1A1A1A',
  muted: '#666666',
  border: '#E8D5B0',
  sectionBg: '#FAF3E8',
  white: '#FFFFFF',
  lifeLine: '#2D6A1F',
  heartLine: '#8B1A3A',
  headLine: '#1A3A8B',
  fateLine: '#7A5C00',
  sunLine: '#B8860B',
  mercuryLine: '#2E8B8B',
  green: '#2D6A1F',
  red: '#8B0000',
};

// ─── STYLES ───────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: { backgroundColor: C.cream, fontFamily: 'NotoSans', paddingTop: 36, paddingBottom: 50, paddingHorizontal: 36 },
  // Cover banner
  coverBanner: { backgroundColor: C.primary, borderRadius: 8, padding: 20, alignItems: 'center', marginBottom: 16 },
  coverBannerSub: { fontSize: 8, color: '#E8D5B0', letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' },
  coverBannerTitle: { fontSize: 20, fontWeight: 700, color: '#FFFFFF', letterSpacing: 1 },
  coverBannerDesc: { fontSize: 9, color: '#E8D5B0', marginTop: 4 },
  // Meta pills row
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  metaPill: { flex: 1, backgroundColor: C.white, border: `0.5pt solid ${C.border}`, borderRadius: 6, padding: 8 },
  metaLabel: { fontSize: 7, color: C.muted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  metaVal: { fontSize: 9, fontWeight: 700, color: C.dark },
  // Score cards
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: C.white, border: `1pt solid ${C.border}`, borderRadius: 8, padding: 12, alignItems: 'center' },
  statLabel: { fontSize: 7, color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 18, fontWeight: 700, color: C.primary },
  // Section wrapper
  section: { marginBottom: 14, backgroundColor: C.white, border: `0.75pt solid ${C.border}`, borderRadius: 8, overflow: 'hidden' },
  sectionHeader: { backgroundColor: C.sectionBg, paddingVertical: 7, paddingHorizontal: 12, borderBottom: `0.5pt solid ${C.border}`, flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionNum: { width: 18, height: 18, borderRadius: 9, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  sectionNumText: { fontSize: 8, fontWeight: 700, color: C.white },
  sectionTitle: { fontSize: 10, fontWeight: 700, color: C.primary, flex: 1 },
  sectionBody: { padding: 12 },
  // Lines grid
  linesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  lineCard: { width: '48%', backgroundColor: C.sectionBg, borderRadius: 6, padding: 10, border: `0.5pt solid ${C.border}` },
  lineDot: { width: 14, height: 3, borderRadius: 2, marginRight: 4 },
  lineCardTitle: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  lineCardName: { fontSize: 9, fontWeight: 700, color: C.dark },
  lineAttrRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  lineAttr: { fontSize: 7, color: C.muted },
  lineVal: { fontSize: 7, fontWeight: 700, color: C.dark },
  linePrediction: { fontSize: 7, color: C.muted, marginTop: 6, paddingTop: 5, borderTop: `0.5pt solid ${C.border}`, lineHeight: 1.5 },
  // Score bar
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  scoreLabel: { fontSize: 8, color: C.dark, width: 95 },
  scoreBarBg: { flex: 1, height: 4, backgroundColor: C.border, borderRadius: 2 },
  scoreBarFill: { height: 4, backgroundColor: C.primary, borderRadius: 2 },
  scoreNum: { fontSize: 8, fontWeight: 700, color: C.primary, width: 28, textAlign: 'right' as const },
  // Mounts grid
  mountsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  mountCard: { width: '31%', backgroundColor: C.sectionBg, borderRadius: 6, padding: 8, border: `0.5pt solid ${C.border}` },
  mountName: { fontSize: 8, fontWeight: 700, color: C.dark, marginBottom: 2 },
  mountDev: { fontSize: 7, color: C.muted, marginBottom: 3 },
  mountBarBg: { height: 3, backgroundColor: C.border, borderRadius: 2, marginBottom: 3 },
  mountBarFill: { height: 3, backgroundColor: C.primary, borderRadius: 2 },
  mountInterp: { fontSize: 7, color: C.muted, lineHeight: 1.3 },
  // Timeline
  timelineItem: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, border: `1.5pt solid ${C.gold}`, backgroundColor: C.white, marginTop: 2 },
  timelineDotActive: { backgroundColor: C.gold },
  timelineContent: { flex: 1 },
  timelineAge: { fontSize: 9, fontWeight: 700, color: C.primary, marginBottom: 2 },
  timelineText: { fontSize: 8, color: C.muted, lineHeight: 1.5 },
  // Remedies
  remedyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  remedyCard: { width: '48%', backgroundColor: C.sectionBg, borderRadius: 6, padding: 10, border: `0.5pt solid ${C.border}` },
  remedyLabel: { fontSize: 7, color: C.muted, marginBottom: 2, textTransform: 'uppercase' as const },
  remedyVal: { fontSize: 9, fontWeight: 700, color: C.primary },
  remedySub: { fontSize: 7, color: C.muted, marginTop: 3, lineHeight: 1.4 },
  // Markings
  markingChip: { flexDirection: 'row', gap: 8, backgroundColor: C.sectionBg, borderRadius: 6, padding: 8, marginBottom: 5, border: `0.5pt solid ${C.border}` },
  markingSymbol: { fontSize: 14, color: C.gold, width: 20 },
  markingName: { fontSize: 8, fontWeight: 700, color: C.dark },
  markingInterp: { fontSize: 7, color: C.muted, lineHeight: 1.4 },
  // Jyotishi note
  jyotishiNote: { borderLeft: `3pt solid ${C.gold}`, paddingLeft: 10, marginTop: 8 },
  jyotishiLabel: { fontSize: 7, color: C.muted, marginBottom: 3 },
  jyotishiText: { fontSize: 8, color: C.dark, lineHeight: 1.6, fontStyle: 'italic' as const },
  // Footer
  footer: { position: 'absolute' as const, bottom: 18, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between', borderTop: `0.5pt solid ${C.border}`, paddingTop: 6 },
  footerText: { fontSize: 6, color: C.muted },
  // Confidence dot
  confRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  confDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  confText: { fontSize: 8, color: C.muted },
  // Body text
  bodyText: { fontSize: 8, color: C.dark, lineHeight: 1.6 },
  // Chips row
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  chip: { backgroundColor: C.sectionBg, borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6, border: `0.5pt solid ${C.border}` },
  chipText: { fontSize: 7, color: C.dark },
  // Marriage row
  marriageRow: { flexDirection: 'row', gap: 8 },
  marriageCol: { flex: 1, backgroundColor: C.sectionBg, borderRadius: 6, padding: 10, border: `0.5pt solid ${C.border}` },
  marriageLabel: { fontSize: 8, fontWeight: 700, color: C.primary, marginBottom: 4 },
  marriageText: { fontSize: 7, color: C.muted, lineHeight: 1.5 },
  // QR placeholder
  qrBox: { width: 50, height: 50, border: `1pt solid ${C.border}`, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  qrText: { fontSize: 6, color: C.muted },
});

// ─── HELPERS ──────────────────────────────────────────────────────
const safe = (v: any, fallback = '—') => (v != null && v !== '' ? String(v) : fallback);

const LINE_COLORS_MAP: Record<string, string> = {
  lifeLine: C.lifeLine, heartLine: C.heartLine, headLine: C.headLine,
  fateLine: C.fateLine, sunLine: C.sunLine, mercuryLine: C.mercuryLine,
};

const LINE_NAMES: Record<string, { en: string; hi: string }> = {
  lifeLine: { en: 'Life Line', hi: 'जीवन रेखा' },
  heartLine: { en: 'Heart Line', hi: 'हृदय रेखा' },
  headLine: { en: 'Head Line', hi: 'मस्तिष्क रेखा' },
  fateLine: { en: 'Fate Line', hi: 'भाग्य रेखा' },
  sunLine: { en: 'Sun Line', hi: 'सूर्य रेखा' },
  mercuryLine: { en: 'Mercury Line', hi: 'बुध रेखा' },
};

const MOUNT_NAMES: Record<string, string> = {
  jupiter: 'Guru (Jupiter)', saturn: 'Shani (Saturn)', apollo: 'Surya (Apollo)',
  mercury: 'Budh (Mercury)', venus: 'Shukra (Venus)', mars: 'Mangal (Mars)',
  marsUpper: 'Upper Mars', marsLower: 'Lower Mars', moon: 'Chandra (Moon)',
};

const CAT_NAMES: Record<string, { en: string; hi: string }> = {
  career: { en: 'Career & Wealth', hi: 'करियर एवं धन' },
  love: { en: 'Love & Relationships', hi: 'प्रेम एवं रिश्ते' },
  health: { en: 'Health & Vitality', hi: 'स्वास्थ्य एवं शक्ति' },
  family: { en: 'Family & Children', hi: 'परिवार एवं संतान' },
  education: { en: 'Education & Knowledge', hi: 'शिक्षा एवं ज्ञान' },
  spiritual: { en: 'Spiritual Growth', hi: 'आध्यात्मिक विकास' },
  travel: { en: 'Travel & Fortune', hi: 'यात्रा एवं भाग्य' },
};

const mountStrengthPercent = (dev?: string): string => {
  if (!dev) return '40%';
  const d = dev.toLowerCase();
  if (d.includes('well') || d.includes('strong') || d.includes('prominent')) return '85%';
  if (d.includes('moderate') || d.includes('average')) return '55%';
  if (d.includes('flat') || d.includes('weak') || d.includes('under')) return '25%';
  return '50%';
};

// ─── SECTION WRAPPER ──────────────────────────────────────────────
const Section = ({ num, title, children }: { num: string; title: string; children: React.ReactNode }) => (
  <View style={s.section} wrap={false}>
    <View style={s.sectionHeader}>
      <View style={s.sectionNum}><Text style={s.sectionNumText}>{num}</Text></View>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
    <View style={s.sectionBody}>{children}</View>
  </View>
);

// ─── LINE CARD ────────────────────────────────────────────────────
const LineCard = ({ lineKey, data }: { lineKey: string; data: any }) => {
  const names = LINE_NAMES[lineKey] || { en: lineKey, hi: '' };
  const color = LINE_COLORS_MAP[lineKey] || C.dark;
  return (
    <View style={s.lineCard} wrap={false}>
      <View style={s.lineCardTitle}>
        <View style={[s.lineDot, { backgroundColor: color }]} />
        <Text style={s.lineCardName}>{names.en} · {names.hi}</Text>
      </View>
      <View style={s.lineAttrRow}><Text style={s.lineAttr}>Depth</Text><Text style={s.lineVal}>{safe(data?.depth)}</Text></View>
      <View style={s.lineAttrRow}><Text style={s.lineAttr}>Length</Text><Text style={s.lineVal}>{safe(data?.curvature || data?.type)}</Text></View>
      <View style={s.lineAttrRow}><Text style={s.lineAttr}>Start → End</Text><Text style={s.lineVal}>{safe(data?.startPoint, '—')} → {safe(data?.endPoint, '—')}</Text></View>
      <View style={s.lineAttrRow}><Text style={s.lineAttr}>Markings</Text><Text style={s.lineVal}>{data?.markings?.length ? data.markings.join(', ') : 'None'}</Text></View>
      <Text style={s.linePrediction}>{safe(data?.samudrikaInterpretation || data?.prediction || data?.meaning, '')}</Text>
    </View>
  );
};

// ─── SCORE BAR ────────────────────────────────────────────────────
const ScoreBar = ({ label, score }: { label: string; score: number }) => (
  <View style={s.scoreRow}>
    <Text style={s.scoreLabel}>{label}</Text>
    <View style={s.scoreBarBg}><View style={[s.scoreBarFill, { width: `${Math.min(score * 10, 100)}%` }]} /></View>
    <Text style={s.scoreNum}>{score}/10</Text>
  </View>
);

// ─── FOOTER ───────────────────────────────────────────────────────
const Footer = ({ readingId }: { readingId: string }) => (
  <View style={s.footer} fixed>
    <Text style={s.footerText}>BhaktVerse AI · Pandit VisionHast</Text>
    <Text style={s.footerText}>For guidance only · Not medical/legal advice</Text>
    <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${readingId} · Page ${pageNumber}/${totalPages}`} />
  </View>
);

// ─── MAIN DOCUMENT ────────────────────────────────────────────────
interface Props {
  analysis: any;
  clientName: string;
  readingId: string;
  generatedAt: string;
  qrDataUrl?: string;
  userDob?: string;
  language?: string;
}

export const PalmReadingPDFDocument: React.FC<Props> = ({
  analysis, clientName, readingId, generatedAt, qrDataUrl, userDob, language
}) => {
  const lines = analysis?.lineAnalysis || {};
  const mounts = analysis?.mountAnalysis || {};
  const categories = analysis?.categories || {};
  const hand = analysis?.handTypeAnalysis || {};
  const secondary = analysis?.secondaryLines || {};
  const timing = analysis?.timingPredictions;
  const markings = analysis?.specialMarkings;
  const quadTri = analysis?.quadrangleAndGreatTriangle;
  const lucky = analysis?.luckyElements || {};
  const yogas = analysis?.yogas || [];
  const warnings = analysis?.warnings || [];
  const remedies = analysis?.remedies || [];
  const blessings = analysis?.blessings || '';

  const palmType = safe(analysis?.palmType, 'Right');
  const dateStr = generatedAt;
  const overallScore = analysis?.overallScore || 0;
  const confidence = analysis?.confidenceScore || 0;

  return (
    <Document title={`Palm Reading — ${clientName}`} author="BhaktVerse AI" creator="BhaktVerse">

      {/* ══════ PAGE 1: COVER ══════ */}
      <Page size="A4" style={s.page}>
        {/* Banner */}
        <View style={s.coverBanner}>
          <Text style={s.coverBannerSub}>Hasta Rekha Vishleshan · Samudrika Shastra</Text>
          <Text style={s.coverBannerTitle}>हस्तरेखा विश्लेषण रिपोर्ट</Text>
          <Text style={s.coverBannerDesc}>AI-Powered Vedic Palm Reading by Pandit VisionHast</Text>
        </View>

        {/* Meta pills */}
        <View style={s.metaRow}>
          <View style={s.metaPill}><Text style={s.metaLabel}>Seeker</Text><Text style={s.metaVal}>{clientName}</Text></View>
          <View style={s.metaPill}><Text style={s.metaLabel}>Hand</Text><Text style={s.metaVal}>{palmType}</Text></View>
          <View style={s.metaPill}><Text style={s.metaLabel}>Date</Text><Text style={s.metaVal}>{dateStr}</Text></View>
          <View style={s.metaPill}><Text style={s.metaLabel}>Report ID</Text><Text style={s.metaVal}>{readingId}</Text></View>
        </View>

        {/* Confidence */}
        <View style={s.confRow}>
          <View style={s.confDot} />
          <Text style={s.confText}>Analysis Confidence: {confidence}%</Text>
        </View>

        {/* Score cards */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statLabel}>Overall Score</Text>
            <Text style={s.statValue}>{overallScore}/10</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statLabel}>Hand Type</Text>
            <Text style={[s.statValue, { fontSize: 13 }]}>{safe(hand.classification, 'Air')}</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statLabel}>Dominant Planet</Text>
            <Text style={[s.statValue, { fontSize: 12 }]}>{safe(analysis?.dominantPlanet, '—')}</Text>
          </View>
        </View>

        {/* Greeting / Destiny note */}
        <View style={s.jyotishiNote} wrap={false}>
          <Text style={s.jyotishiLabel}>Pandit VisionHast ka Ashirvad</Text>
          <Text style={s.jyotishiText}>{safe(analysis?.greeting || analysis?.overallDestiny, '')}</Text>
        </View>

        {/* QR Code */}
        {qrDataUrl && (
          <View style={s.qrBox} wrap={false}>
            <Image src={qrDataUrl} style={{ width: 46, height: 46 }} />
          </View>
        )}

        <Footer readingId={readingId} />
      </Page>

      {/* ══════ PAGE 2: HAND CONSTITUTION + LINES ══════ */}
      <Page size="A4" style={s.page}>
        {/* Section 1: Hand Constitution */}
        <Section num="1" title="Hast Rachna — Hand Constitution">
          <View style={s.metaRow}>
            <View style={s.metaPill}><Text style={s.metaLabel}>Shape</Text><Text style={s.metaVal}>{safe(hand.palmShape)}</Text></View>
            <View style={s.metaPill}><Text style={s.metaLabel}>Finger Ratio</Text><Text style={s.metaVal}>{safe(hand.fingerToPalmRatio)}</Text></View>
            <View style={s.metaPill}><Text style={s.metaLabel}>Element</Text><Text style={s.metaVal}>{safe(hand.tatvaElement)}</Text></View>
            <View style={s.metaPill}><Text style={s.metaLabel}>Type</Text><Text style={s.metaVal}>{safe(hand.classification)}</Text></View>
          </View>
          <Text style={s.bodyText}>{safe(hand.personalityProfile, '')}</Text>
          {(hand.strengths?.length > 0 || hand.challenges?.length > 0) && (
            <View style={s.chipsRow}>
              {(hand.strengths || []).map((st: string, i: number) => (
                <View key={`s${i}`} style={[s.chip, { borderColor: C.green }]}><Text style={[s.chipText, { color: C.green }]}>✓ {st}</Text></View>
              ))}
              {(hand.challenges || []).map((ch: string, i: number) => (
                <View key={`c${i}`} style={[s.chip, { borderColor: C.red }]}><Text style={[s.chipText, { color: C.red }]}>⚠ {ch}</Text></View>
              ))}
            </View>
          )}
        </Section>

        {/* Section 2: Major Lines */}
        <Section num="2" title="Pramukh Rekhayein — Major Palm Lines">
          <View style={s.linesGrid}>
            {Object.entries(lines).map(([key, data]) => (
              <LineCard key={key} lineKey={key} data={data} />
            ))}
          </View>
        </Section>

        <Footer readingId={readingId} />
      </Page>

      {/* ══════ PAGE 3: TIMELINE + MOUNTS + MARRIAGE ══════ */}
      <Page size="A4" style={s.page}>
        {/* Section 3: Age Timeline */}
        {timing && (
          <Section num="3" title="Kaal Drishti — Age Timeline Predictions">
            {[
              { age: 'Next 1 Year', text: timing.next_1_year, active: true },
              { age: 'Next 3 Years', text: timing.next_3_years, active: false },
              { age: 'Next 7 Years', text: timing.next_7_years, active: false },
              { age: `Peak Success: ${safe(timing.age_of_peak_success)}`, text: timing.financial_growth_periods?.join(', ') || '', active: false },
            ].filter(item => item.text).map((item, i) => (
              <View key={i} style={s.timelineItem} wrap={false}>
                <View style={[s.timelineDot, item.active && s.timelineDotActive]} />
                <View style={s.timelineContent}>
                  <Text style={s.timelineAge}>{item.age}</Text>
                  <Text style={s.timelineText}>{item.text}</Text>
                </View>
              </View>
            ))}
            {timing.health_alert_periods?.length > 0 && (
              <View wrap={false} style={{ marginTop: 6 }}>
                <Text style={{ fontSize: 8, fontWeight: 700, color: C.red, marginBottom: 3 }}>Health Alert Periods:</Text>
                <Text style={s.timelineText}>{timing.health_alert_periods.join(', ')}</Text>
              </View>
            )}
          </Section>
        )}

        {/* Section 4: Mounts */}
        <Section num="4" title="Parvat Vigyan — Mount Analysis">
          <View style={s.mountsGrid}>
            {Object.entries(mounts).map(([key, mount]: [string, any]) => (
              <View key={key} style={s.mountCard} wrap={false}>
                <Text style={s.mountName}>{MOUNT_NAMES[key] || key}</Text>
                <Text style={s.mountDev}>{safe(mount?.development || mount?.strength)}</Text>
                <View style={s.mountBarBg}>
                  <View style={[s.mountBarFill, { width: mountStrengthPercent(mount?.development || mount?.strength) }]} />
                </View>
                <Text style={s.mountInterp}>{safe(mount?.interpretation || mount?.observed, '')}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Section 5: Marriage Lines */}
        {(secondary?.marriageLines || secondary?.childrenLines) && (
          <Section num="5" title="Vivah aur Santan Rekha — Marriage & Children Lines">
            <View style={s.marriageRow}>
              {secondary.marriageLines && (
                <View style={s.marriageCol} wrap={false}>
                  <Text style={s.marriageLabel}>Marriage Lines</Text>
                  <Text style={s.marriageText}>Count: {safe(secondary.marriageLines.count)}</Text>
                  <Text style={s.marriageText}>Depth: {safe(secondary.marriageLines.depth)}</Text>
                  <Text style={s.marriageText}>{safe(secondary.marriageLines.interpretation, '')}</Text>
                </View>
              )}
              {secondary.childrenLines && (
                <View style={s.marriageCol} wrap={false}>
                  <Text style={s.marriageLabel}>Children Lines</Text>
                  <Text style={s.marriageText}>Count: {safe(secondary.childrenLines.count)}</Text>
                  <Text style={s.marriageText}>{safe(secondary.childrenLines.interpretation, '')}</Text>
                </View>
              )}
            </View>
          </Section>
        )}

        <Footer readingId={readingId} />
      </Page>

      {/* ══════ PAGE 4: MARKINGS + REMEDIES ══════ */}
      <Page size="A4" style={s.page}>
        {/* Section 6: Special Markings */}
        {markings && (
          <Section num="6" title="Vishesh Chinh — Special Markings">
            {[
              ...(markings.stars || []).map((m: any) => ({ symbol: '★', ...m })),
              ...(markings.triangles || []).map((m: any) => ({ symbol: '△', ...m })),
              ...(markings.crosses || []).map((m: any) => ({ symbol: '+', ...m })),
              ...(markings.squares || []).map((m: any) => ({ symbol: '□', ...m })),
              ...(markings.grilles || []).map((m: any) => ({ symbol: '#', ...m })),
            ].map((mark, i) => (
              <View key={i} style={s.markingChip} wrap={false}>
                <Text style={s.markingSymbol}>{mark.symbol}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.markingName}>{safe(mark.location)}</Text>
                  <Text style={s.markingInterp}>{safe(mark.interpretation, '')}</Text>
                </View>
              </View>
            ))}
            {/* Special flags */}
            {markings.mysticCross?.present && (
              <View style={s.markingChip} wrap={false}>
                <Text style={s.markingSymbol}>✦</Text>
                <View style={{ flex: 1 }}><Text style={s.markingName}>Mystic Cross</Text><Text style={s.markingInterp}>{safe(markings.mysticCross.interpretation, '')}</Text></View>
              </View>
            )}
            {markings.simianLine?.present && (
              <View style={s.markingChip} wrap={false}>
                <Text style={s.markingSymbol}>═</Text>
                <View style={{ flex: 1 }}><Text style={s.markingName}>Simian Line</Text><Text style={s.markingInterp}>{safe(markings.simianLine.interpretation, '')}</Text></View>
              </View>
            )}
            {markings.ringOfSolomon?.present && (
              <View style={s.markingChip} wrap={false}>
                <Text style={s.markingSymbol}>◎</Text>
                <View style={{ flex: 1 }}><Text style={s.markingName}>Ring of Solomon</Text><Text style={s.markingInterp}>{safe(markings.ringOfSolomon.interpretation, '')}</Text></View>
              </View>
            )}
          </Section>
        )}

        {/* Quadrangle & Great Triangle */}
        {quadTri && (
          <Section num="6b" title="Chatushkon aur Maha Tribhuj — Quadrangle & Great Triangle">
            <View style={s.marriageRow}>
              {quadTri.quadrangle && (
                <View style={s.marriageCol} wrap={false}>
                  <Text style={s.marriageLabel}>Quadrangle (Chatushkon)</Text>
                  <Text style={s.marriageText}>Shape: {safe(quadTri.quadrangle.shape)}</Text>
                  <Text style={s.marriageText}>{safe(quadTri.quadrangle.interpretation, '')}</Text>
                </View>
              )}
              {quadTri.greatTriangle && (
                <View style={s.marriageCol} wrap={false}>
                  <Text style={s.marriageLabel}>Great Triangle (Maha Tribhuj)</Text>
                  <Text style={s.marriageText}>Shape: {safe(quadTri.greatTriangle.shape)}</Text>
                  <Text style={s.marriageText}>{safe(quadTri.greatTriangle.interpretation, '')}</Text>
                </View>
              )}
            </View>
          </Section>
        )}

        {/* Section 7: Remedies */}
        <Section num="7" title="Upay aur Sujhav — Remedies & Recommendations">
          {/* Lucky elements as remedy cards */}
          <View style={s.remedyGrid}>
            <View style={s.remedyCard} wrap={false}>
              <Text style={s.remedyLabel}>Gemstones</Text>
              <Text style={s.remedyVal}>{lucky.gemstones?.join(', ') || '—'}</Text>
              <Text style={s.remedySub}>Wear as recommended by your jyotishi</Text>
            </View>
            <View style={s.remedyCard} wrap={false}>
              <Text style={s.remedyLabel}>Lucky Colors</Text>
              <Text style={s.remedyVal}>{lucky.colors?.join(', ') || '—'}</Text>
            </View>
            <View style={s.remedyCard} wrap={false}>
              <Text style={s.remedyLabel}>Lucky Days</Text>
              <Text style={s.remedyVal}>{lucky.days?.join(', ') || '—'}</Text>
            </View>
            <View style={s.remedyCard} wrap={false}>
              <Text style={s.remedyLabel}>Lucky Numbers</Text>
              <Text style={s.remedyVal}>{lucky.numbers?.join(', ') || '—'}</Text>
            </View>
          </View>
          {/* Mantras */}
          {lucky.mantras?.length > 0 && (
            <View style={{ marginTop: 8 }} wrap={false}>
              <Text style={{ fontSize: 8, fontWeight: 700, color: C.primary, marginBottom: 4 }}>Recommended Mantras:</Text>
              {lucky.mantras.map((m: any, i: number) => (
                <Text key={i} style={{ fontSize: 7, color: C.dark, marginBottom: 2, lineHeight: 1.5 }}>
                  {typeof m === 'string' ? m : `${m.sanskrit || ''} — ${m.meaning || ''}`}
                </Text>
              ))}
            </View>
          )}
          {/* General remedies */}
          {remedies.length > 0 && (
            <View style={{ marginTop: 8 }} wrap={false}>
              <Text style={{ fontSize: 8, fontWeight: 700, color: C.primary, marginBottom: 4 }}>General Remedies:</Text>
              {remedies.map((r: string, i: number) => (
                <Text key={i} style={{ fontSize: 7, color: C.muted, marginBottom: 2, lineHeight: 1.5 }}>• {r}</Text>
              ))}
            </View>
          )}
        </Section>

        <Footer readingId={readingId} />
      </Page>

      {/* ══════ PAGE 5: CATEGORY PREDICTIONS + SUMMARY ══════ */}
      <Page size="A4" style={s.page}>
        {/* Section 8: Category Predictions */}
        <Section num="8" title="Kshetra Vishleshan — Category Predictions">
          {Object.entries(categories).map(([key, cat]: [string, any]) => {
            const names = CAT_NAMES[key] || { en: key, hi: '' };
            return (
              <View key={key} style={{ marginBottom: 8, backgroundColor: C.sectionBg, borderRadius: 6, padding: 8, border: `0.5pt solid ${C.border}` }} wrap={false}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 9, fontWeight: 700, color: C.dark }}>{names.en} · {names.hi}</Text>
                  <Text style={{ fontSize: 9, fontWeight: 700, color: C.primary }}>{cat?.rating || 0}/10</Text>
                </View>
                <View style={s.scoreBarBg}><View style={[s.scoreBarFill, { width: `${Math.min((cat?.rating || 0) * 10, 100)}%` }]} /></View>
                <Text style={{ fontSize: 7, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{safe(cat?.prediction, '')}</Text>
                {cat?.guidance && <Text style={{ fontSize: 7, color: C.primary, marginTop: 2, lineHeight: 1.4 }}>Guidance: {cat.guidance}</Text>}
              </View>
            );
          })}
        </Section>

        <Footer readingId={readingId} />
      </Page>

      {/* ══════ PAGE 6: OVERALL SUMMARY ══════ */}
      <Page size="A4" style={s.page}>
        {/* Section 9: Overall Summary */}
        <Section num="9" title="Samagra Saranksh — Overall Summary & Blessings">
          {/* Archetype pills */}
          <View style={s.statsRow}>
            <View style={s.statCard} wrap={false}>
              <Text style={s.statLabel}>Nakshatra</Text>
              <Text style={[s.statValue, { fontSize: 11 }]}>{safe(analysis?.nakshatra)}</Text>
            </View>
            <View style={s.statCard} wrap={false}>
              <Text style={s.statLabel}>Classification</Text>
              <Text style={[s.statValue, { fontSize: 11 }]}>{safe(hand.classification)}</Text>
            </View>
            <View style={s.statCard} wrap={false}>
              <Text style={s.statLabel}>Peak Age</Text>
              <Text style={[s.statValue, { fontSize: 11 }]}>{safe(timing?.age_of_peak_success)}</Text>
            </View>
          </View>

          {/* Yogas */}
          {yogas.length > 0 && (
            <View style={{ marginBottom: 8 }} wrap={false}>
              <Text style={{ fontSize: 8, fontWeight: 700, color: C.primary, marginBottom: 4 }}>Yogas (Special Combinations):</Text>
              <View style={s.chipsRow}>
                {yogas.map((y: string, i: number) => (
                  <View key={i} style={[s.chip, { borderColor: C.gold }]}><Text style={[s.chipText, { color: C.gold }]}>⭐ {y}</Text></View>
                ))}
              </View>
            </View>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <View style={{ marginBottom: 8 }} wrap={false}>
              <Text style={{ fontSize: 8, fontWeight: 700, color: C.red, marginBottom: 4 }}>Warnings & Cautions:</Text>
              {warnings.map((w: string, i: number) => (
                <Text key={i} style={{ fontSize: 7, color: C.muted, marginBottom: 2 }}>⚠ {w}</Text>
              ))}
            </View>
          )}

          {/* Blessings */}
          <View style={s.jyotishiNote} wrap={false}>
            <Text style={s.jyotishiLabel}>Pandit VisionHast ka Antim Ashirvad</Text>
            <Text style={s.jyotishiText}>{safe(blessings, 'May the divine light guide your spiritual journey. Om Shanti 🙏')}</Text>
          </View>

          {/* Accuracy note */}
          {analysis?.accuracyNotes && (
            <View style={{ marginTop: 10, backgroundColor: C.sectionBg, borderRadius: 6, padding: 8, border: `0.5pt solid ${C.border}` }} wrap={false}>
              <Text style={{ fontSize: 7, color: C.muted, lineHeight: 1.5 }}>{analysis.accuracyNotes}</Text>
            </View>
          )}
        </Section>

        {/* Disclaimer */}
        <View style={{ marginTop: 10, padding: 10, backgroundColor: C.sectionBg, borderRadius: 6, border: `0.5pt solid ${C.border}` }} wrap={false}>
          <Text style={{ fontSize: 6, color: C.muted, lineHeight: 1.6, textAlign: 'center' }}>
            This report is generated by BhaktVerse AI using Samudrika Shastra, Western Chiromancy, and Chinese Shou Xiang methodologies.
            It is intended for spiritual guidance and entertainment purposes only. It should not be considered a substitute for professional medical,
            legal, or financial advice. Consult qualified professionals for specific concerns.
          </Text>
        </View>

        <Footer readingId={readingId} />
      </Page>
    </Document>
  );
};
