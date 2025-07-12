import { PrismaClient } from '@prisma/client';
import { AuditLog } from '../types/audit';

const prisma = new PrismaClient();

export interface AdminDashboardStats {
  totalBedrifter: number;
  activeBedrifter: number;
  totalBrukere: number;
  activeServices: number;
  totalSikkerhetskontroller: number;
  totalKontrakter: number;
  totalElever: number;
  totalAnsatte: number;
  systemHealth: {
    database: { status: string; connections: number; maxConnections: number };
    api: { status: string; responseTime: number; requestsPerMinute: number; errorRate: number };
    memory: { used: number; total: number; percentage: number };
    cpu: { usage: number; cores: number };
    services: Array<{ name: string; status: string; uptime: number }>;
  };
}

export interface BedriftDashboardStats {
  totalAnsatte: number;
  totalElever: number;
  aktiveSikkerhetskontroller: number;
  fullforteKontroller: number;
  ventendeSoknader: number;
  aktiverKontrakter: number;
  totalInntekter: number;
  aktivKjoretoy: number;
  planlagteTimer: number;
  fullforteTimer: number;
  ventendeTasks: number;
  systemNotifikasjoner: number;
}

export interface ElevDashboardStats {
  totalSikkerhetskontroller: number;
  fullforteSikkerhetskontroller: number;
  progresjonProsent: number;
  aktiveKurs: number;
  fullforteKurs: number;
  plannedeLektioner: number;
  fullforteLektioner: number;
  achievements: number;
  totalXP: number;
  streak: number;
  kontrakterAktive: number;
  sisteAktivitet: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  beskrivelse: string;
  tidspunkt: string;
  status: 'success' | 'warning' | 'error';
  xpGain?: number;
}

export interface UpcomingEvent {
  id: string;
  tittel: string;
  dato: string;
  type: string;
  instruktor?: string;
  elev?: string;
  lokasjon?: string;
}

export interface Achievement {
  id: string;
  navn: string;
  beskrivelse: string;
  ikonUrl?: string;
  oppnaddDato: string;
  xpBelonning: number;
  sjelden: boolean;
}

export interface SikkerhetskontrollProgress {
  kategori: string;
  totalSporsmal: number;
  besvartSporsmal: number;
  korrekteSvar: number;
  progresjonProsent: number;
  status: 'ikke_sett' | 'sett' | 'vanskelig' | 'mestret';
}

export class DashboardService {
  // Admin Dashboard Methods
  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    const [
      totalBedrifter,
      activeBedrifter,
      totalBrukere,
      totalSikkerhetskontroller,
      totalKontrakter,
      totalElever,
      totalAnsatte,
      activeServices
    ] = await Promise.all([
      prisma.bedrift.count({ where: { isDeleted: false } }),
      prisma.bedrift.count({ where: { isDeleted: false, ansatte: { some: { aktiv: true } } } }),
      prisma.user.count({ where: { isDeleted: false } }),
      prisma.sikkerhetskontroll.count({ where: { isDeleted: false, aktiv: true } }),
      prisma.kontrakt.count({ where: { isDeleted: false } }),
      prisma.elev.count({ where: { isDeleted: false } }),
      prisma.ansatt.count({ where: { isDeleted: false } }),
      prisma.bedriftService.count({ where: { aktiv: true } })
    ]);

    // Mock system health data - in production, this would come from monitoring services
    const systemHealth = {
      database: { status: 'healthy', connections: 12, maxConnections: 100 },
      api: { status: 'healthy', responseTime: 145, requestsPerMinute: 1250, errorRate: 0.02 },
      memory: { used: 2.3 * 1024 * 1024 * 1024, total: 8 * 1024 * 1024 * 1024, percentage: 28.75 },
      cpu: { usage: 35, cores: 4 },
      services: [
        { name: 'Database', status: 'healthy', uptime: 99.9 },
        { name: 'API Server', status: 'healthy', uptime: 99.8 },
        { name: 'File Storage', status: 'healthy', uptime: 99.9 },
        { name: 'Email Service', status: 'healthy', uptime: 99.7 }
      ]
    };

    return {
      totalBedrifter,
      activeBedrifter,
      totalBrukere,
      activeServices,
      totalSikkerhetskontroller,
      totalKontrakter,
      totalElever,
      totalAnsatte,
      systemHealth
    };
  }

  async getAdminRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
    const auditLogs = await prisma.auditLog.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: { user: true }
    });

    return auditLogs.map(log => ({
      id: log.id.toString(),
      type: log.tableName.toLowerCase(),
      beskrivelse: `${log.action} ${log.tableName} av ${log.user?.fornavn || 'System'}`,
      tidspunkt: log.timestamp.toISOString(),
      status: log.action === 'DELETE' ? 'warning' : 'success'
    }));
  }

  // Company Dashboard Methods
  async getBedriftDashboardStats(bedriftId: number): Promise<BedriftDashboardStats> {
    const [
      totalAnsatte,
      totalElever,
      aktiveSikkerhetskontroller,
      fullforteKontroller,
      ventendeSoknader,
      aktiverKontrakter,
      aktivKjoretoy,
      planlagteTimer,
      fullforteTimer,
      ventendeTasks,
      systemNotifikasjoner
    ] = await Promise.all([
      prisma.ansatt.count({ where: { bedriftId, isDeleted: false, aktiv: true } }),
      prisma.elev.count({ where: { bedriftId, isDeleted: false } }),
      prisma.sikkerhetskontroll.count({ where: { bedriftId, isDeleted: false, aktiv: true } }),
      prisma.sikkerhetskontrollElevProgresjon.count({ where: { mestret: true, elev: { bedriftId } } }),
      prisma.elevSoknad.count({ where: { bedriftId, status: 'PENDING' } }),
      prisma.kontrakt.count({ where: { bedriftId, isDeleted: false, status: 'AKTIV' } }),
      prisma.kjoretoy.count({ where: { bedriftId, isDeleted: false, status: 'AKTIV' } }),
      prisma.kalenderEvent.count({ where: { bedriftId, isDeleted: false } }),
      prisma.kalenderEvent.count({ where: { bedriftId, isDeleted: false, status: 'GJENNOMFØRT' } }),
      prisma.oppgave.count({ where: { bedriftId, isDeleted: false, status: { in: ['IKKE_PAABEGYNT', 'PAABEGYNT'] } } }),
      prisma.notification.count({ where: { mottaker: { bedriftId }, lest: false } })
    ]);

    // Calculate total income for current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const payments = await prisma.paymentTransaction.findMany({
      where: {
        kontrakt: { bedriftId },
        status: 'COMPLETED',
        betalingsdato: { gte: currentMonth }
      }
    });

    const totalInntekter = payments.reduce((sum, payment) => sum + payment.belop, 0);

    return {
      totalAnsatte,
      totalElever,
      aktiveSikkerhetskontroller,
      fullforteKontroller,
      ventendeSoknader,
      aktiverKontrakter,
      totalInntekter,
      aktivKjoretoy,
      planlagteTimer,
      fullforteTimer,
      ventendeTasks,
      systemNotifikasjoner
    };
  }

  async getBedriftRecentActivity(bedriftId: number, limit: number = 10): Promise<ActivityItem[]> {
    const activities: ActivityItem[] = [];

    // Get recent elev registrations
    const recentElever = await prisma.elev.findMany({
      where: { bedriftId, isDeleted: false },
      take: Math.ceil(limit / 4),
      orderBy: { opprettet: 'desc' }
    });

    activities.push(...recentElever.map(elev => ({
      id: `elev-${elev.id}`,
      type: 'elev',
      beskrivelse: `Ny elev registrert: ${elev.fornavn} ${elev.etternavn}`,
      tidspunkt: elev.opprettet.toISOString(),
      status: 'success' as const
    })));

    // Get recent sikkerhetskontroll completions
    const recentKontroller = await prisma.sikkerhetskontrollElevProgresjon.findMany({
      where: { 
        mestret: true, 
        elev: { bedriftId },
        mestretDato: { not: null }
      },
      take: Math.ceil(limit / 4),
      orderBy: { mestretDato: 'desc' },
      include: { elev: true, kategori: true }
    });

    activities.push(...recentKontroller.map(kontroll => ({
      id: `kontroll-${kontroll.id}`,
      type: 'sikkerhetskontroll',
      beskrivelse: `Sikkerhetskontroll fullført: ${kontroll.kategori?.navn || 'Ukjent'} av ${kontroll.elev.fornavn}`,
      tidspunkt: kontroll.mestretDato!.toISOString(),
      status: 'success' as const
    })));

    // Get recent kontrakter
    const recentKontrakter = await prisma.kontrakt.findMany({
      where: { bedriftId, isDeleted: false },
      take: Math.ceil(limit / 4),
      orderBy: { opprettet: 'desc' }
    });

    activities.push(...recentKontrakter.map(kontrakt => ({
      id: `kontrakt-${kontrakt.id}`,
      type: 'kontrakt',
      beskrivelse: `Ny kontrakt opprettet for ${kontrakt.elevFornavn} ${kontrakt.elevEtternavn}`,
      tidspunkt: kontrakt.opprettet.toISOString(),
      status: 'success' as const
    })));

    // Get recent kalender events
    const recentEvents = await prisma.kalenderEvent.findMany({
      where: { bedriftId, isDeleted: false },
      take: Math.ceil(limit / 4),
      orderBy: { opprettet: 'desc' }
    });

    activities.push(...recentEvents.map(event => ({
      id: `event-${event.id}`,
      type: 'kalender',
      beskrivelse: `Kalenderoppføring: ${event.tittel}`,
      tidspunkt: event.opprettet.toISOString(),
      status: event.status === 'AVLYST' ? 'warning' : 'success' as const
    })));

    return activities
      .sort((a, b) => new Date(b.tidspunkt).getTime() - new Date(a.tidspunkt).getTime())
      .slice(0, limit);
  }

  async getBedriftUpcomingEvents(bedriftId: number, limit: number = 10): Promise<UpcomingEvent[]> {
    const events = await prisma.kalenderEvent.findMany({
      where: {
        bedriftId,
        isDeleted: false,
        startDato: { gte: new Date() }
      },
      take: limit,
      orderBy: { startDato: 'asc' },
      include: { instruktor: true, elev: true }
    });

    return events.map(event => ({
      id: event.id.toString(),
      tittel: event.tittel,
      dato: event.startDato.toISOString(),
      type: event.type.toLowerCase(),
      instruktor: event.instruktor ? `${event.instruktor.fornavn} ${event.instruktor.etternavn}` : undefined,
      elev: event.elev ? `${event.elev.fornavn} ${event.elev.etternavn}` : undefined,
      lokasjon: event.lokasjon || undefined
    }));
  }

  // Student Dashboard Methods
  async getElevDashboardStats(elevId: number): Promise<ElevDashboardStats> {
    const elev = await prisma.elev.findUnique({
      where: { id: elevId },
      include: { sikkerhetskontrollProgresjon: true, sikkerhetskontrollAchievements: true }
    });

    if (!elev) {
      throw new Error('Elev not found');
    }

    const [
      totalSikkerhetskontroller,
      fullforteSikkerhetskontroller,
      aktiveKurs,
      fullforteKurs,
      plannedeLektioner,
      fullforteLektioner,
      achievements,
      totalXP,
      kontrakterAktive
    ] = await Promise.all([
      prisma.sikkerhetskontrollSporsmal.count({ where: { aktiv: true } }),
      prisma.sikkerhetskontrollElevProgresjon.count({ where: { elevId, mestret: true } }),
      // Mock data for courses - could be implemented with a separate course system
      Promise.resolve(2),
      Promise.resolve(8),
      prisma.kalenderEvent.count({ where: { elevId, isDeleted: false } }),
      prisma.kalenderEvent.count({ where: { elevId, isDeleted: false, status: 'GJENNOMFØRT' } }),
      prisma.sikkerhetskontrollElevAchievement.count({ where: { elevId } }),
      prisma.sikkerhetskontrollElevProgresjon.aggregate({
        where: { elevId },
        _sum: { xpOpptjent: true }
      }).then(result => result._sum.xpOpptjent || 0),
      prisma.kontrakt.count({ where: { elevId, isDeleted: false, status: 'AKTIV' } })
    ]);

    // Calculate progression percentage
    const progresjonProsent = totalSikkerhetskontroller > 0 
      ? Math.round((fullforteSikkerhetskontroller / totalSikkerhetskontroller) * 100)
      : 0;

    // Calculate streak - simplified calculation
    const sisteAktivitet = elev.sikkerhetskontrollProgresjon
      .sort((a, b) => new Date(b.sisteAktivitet).getTime() - new Date(a.sisteAktivitet).getTime())[0];

    const streak = sisteAktivitet ? 
      Math.max(0, Math.floor((Date.now() - new Date(sisteAktivitet.sisteAktivitet).getTime()) / (1000 * 60 * 60 * 24))) : 0;

    return {
      totalSikkerhetskontroller,
      fullforteSikkerhetskontroller,
      progresjonProsent,
      aktiveKurs,
      fullforteKurs,
      plannedeLektioner,
      fullforteLektioner,
      achievements,
      totalXP,
      streak,
      kontrakterAktive,
      sisteAktivitet: sisteAktivitet?.sisteAktivitet.toISOString() || new Date().toISOString()
    };
  }

  async getElevRecentActivity(elevId: number, limit: number = 10): Promise<ActivityItem[]> {
    const activities: ActivityItem[] = [];

    // Get recent sikkerhetskontroll progress
    const recentProgress = await prisma.sikkerhetskontrollElevProgresjon.findMany({
      where: { elevId, mestret: true },
      take: Math.ceil(limit / 3),
      orderBy: { mestretDato: 'desc' },
      include: { kategori: true }
    });

    activities.push(...recentProgress.map(progress => ({
      id: `progress-${progress.id}`,
      type: 'sikkerhetskontroll',
      beskrivelse: `Fullført sikkerhetskontroll: ${progress.kategori?.navn || 'Ukjent kategori'}`,
      tidspunkt: progress.mestretDato!.toISOString(),
      status: 'success' as const,
      xpGain: progress.xpOpptjent
    })));

    // Get recent achievements
    const recentAchievements = await prisma.sikkerhetskontrollElevAchievement.findMany({
      where: { elevId },
      take: Math.ceil(limit / 3),
      orderBy: { oppnaddDato: 'desc' },
      include: { achievement: true }
    });

    activities.push(...recentAchievements.map(achievement => ({
      id: `achievement-${achievement.id}`,
      type: 'achievement',
      beskrivelse: `Ny prestasjon oppnådd: ${achievement.achievement.navn}`,
      tidspunkt: achievement.oppnaddDato.toISOString(),
      status: 'success' as const,
      xpGain: achievement.achievement.xpBelonning
    })));

    // Get recent calendar events
    const recentLessons = await prisma.kalenderEvent.findMany({
      where: { elevId, isDeleted: false, status: 'GJENNOMFØRT' },
      take: Math.ceil(limit / 3),
      orderBy: { sluttDato: 'desc' },
      include: { instruktor: true }
    });

    activities.push(...recentLessons.map(lesson => ({
      id: `lesson-${lesson.id}`,
      type: 'lesson',
      beskrivelse: `${lesson.tittel} fullført med ${lesson.instruktor?.fornavn || 'ukjent instruktør'}`,
      tidspunkt: lesson.sluttDato.toISOString(),
      status: 'success' as const
    })));

    return activities
      .sort((a, b) => new Date(b.tidspunkt).getTime() - new Date(a.tidspunkt).getTime())
      .slice(0, limit);
  }

  async getElevUpcomingLessons(elevId: number, limit: number = 10): Promise<UpcomingEvent[]> {
    const lessons = await prisma.kalenderEvent.findMany({
      where: {
        elevId,
        isDeleted: false,
        startDato: { gte: new Date() }
      },
      take: limit,
      orderBy: { startDato: 'asc' },
      include: { instruktor: true }
    });

    return lessons.map(lesson => ({
      id: lesson.id.toString(),
      tittel: lesson.tittel,
      dato: lesson.startDato.toISOString(),
      type: lesson.type.toLowerCase(),
      instruktor: lesson.instruktor ? `${lesson.instruktor.fornavn} ${lesson.instruktor.etternavn}` : undefined,
      lokasjon: lesson.lokasjon || undefined
    }));
  }

  async getElevRecentAchievements(elevId: number, limit: number = 5): Promise<Achievement[]> {
    const achievements = await prisma.sikkerhetskontrollElevAchievement.findMany({
      where: { elevId },
      take: limit,
      orderBy: { oppnaddDato: 'desc' },
      include: { achievement: true }
    });

    return achievements.map(achievement => ({
      id: achievement.id.toString(),
      navn: achievement.achievement.navn,
      beskrivelse: achievement.achievement.beskrivelse,
      ikonUrl: achievement.achievement.ikonUrl || undefined,
      oppnaddDato: achievement.oppnaddDato.toISOString(),
      xpBelonning: achievement.achievement.xpBelonning,
      sjelden: achievement.achievement.sjelden
    }));
  }

  async getElevSikkerhetskontrollProgress(elevId: number): Promise<SikkerhetskontrollProgress[]> {
    const kategorier = await prisma.sikkerhetskontrollKategori.findMany({
      where: { aktiv: true },
      include: {
        sporsmal: { where: { aktiv: true } },
        elevProgresjon: { where: { elevId } }
      }
    });

    return kategorier.map(kategori => {
      const progresjon = kategori.elevProgresjon[0];
      const totalSporsmal = kategori.sporsmal.length;
      const besvartSporsmal = progresjon?.antallSporsmalSett || 0;
      const korrekteSvar = progresjon?.antallRiktigeForsok || 0;
      const progresjonProsent = totalSporsmal > 0 ? Math.round((besvartSporsmal / totalSporsmal) * 100) : 0;

      let status: 'ikke_sett' | 'sett' | 'vanskelig' | 'mestret' = 'ikke_sett';
      if (progresjon?.mestret) {
        status = 'mestret';
      } else if (progresjon?.antallGaleForsok > progresjon?.antallRiktigeForsok) {
        status = 'vanskelig';
      } else if (besvartSporsmal > 0) {
        status = 'sett';
      }

      return {
        kategori: kategori.navn,
        totalSporsmal,
        besvartSporsmal,
        korrekteSvar,
        progresjonProsent,
        status
      };
    });
  }
}

export const dashboardService = new DashboardService();