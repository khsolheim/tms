import { PrismaClient, QuizKategori, QuizSporsmal } from '@prisma/client';
import { BaseService } from './base.service';
import { ValidationError, NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

export interface CreateQuizKategoriData {
  navn: string;
  klasse: string;
  hovedkategoriId?: number;
}

export interface UpdateQuizKategoriData {
  navn?: string;
  klasse?: string;
  hovedkategoriId?: number;
}

export interface CreateQuizSporsmalData {
  tekst: string;
  svaralternativer: string[];
  riktigSvar: number;
  bildeUrl?: string;
  forklaring?: string;
  klasser: string[];
  kategoriId?: number;
}

export interface UpdateQuizSporsmalData {
  tekst?: string;
  svaralternativer?: string[];
  riktigSvar?: number;
  bildeUrl?: string;
  forklaring?: string;
  klasser?: string[];
  kategoriId?: number;
}

export interface QuizKategoriMedSporsmal extends QuizKategori {
  underkategorier: QuizKategori[];
  hovedkategori?: QuizKategori | null;
  _count: {
    sporsmal: number;
  };
}

export interface QuizSporsmalMedKategori extends QuizSporsmal {
  kategori?: QuizKategori | null;
}

export class QuizService extends BaseService {
  constructor() {
    super();
  }

  // Quiz kategorier
  async getKategorier(klasse?: string): Promise<QuizKategoriMedSporsmal[]> {
    const where = klasse ? { klasse } : {};
    
    logger.info('Henter quiz kategorier', { klasse });
    
    return this.prisma.quizKategori.findMany({
      where,
      include: {
        underkategorier: true,
        hovedkategori: true,
        _count: {
          select: { sporsmal: true }
        }
      },
      orderBy: { navn: 'asc' }
    });
  }

  async getKategoriById(id: number): Promise<QuizKategoriMedSporsmal> {
    const kategori = await this.prisma.quizKategori.findUnique({
      where: { id },
      include: {
        underkategorier: true,
        hovedkategori: true,
        _count: {
          select: { sporsmal: true }
        }
      }
    });

    if (!kategori) {
      throw new NotFoundError('Quiz kategori ikke funnet');
    }

    return kategori;
  }

  async createKategori(data: CreateQuizKategoriData): Promise<QuizKategoriMedSporsmal> {
    // Valider at hovedkategori eksisterer hvis oppgitt
    if (data.hovedkategoriId) {
      const hovedkategori = await this.prisma.quizKategori.findUnique({
        where: { id: data.hovedkategoriId }
      });
      
      if (!hovedkategori) {
        throw new ValidationError('Hovedkategori ikke funnet');
      }
    }

    logger.info('Oppretter quiz kategori', { data });

    return this.prisma.quizKategori.create({
      data,
      include: {
        underkategorier: true,
        hovedkategori: true,
        _count: {
          select: { sporsmal: true }
        }
      }
    });
  }

  async updateKategori(id: number, data: UpdateQuizKategoriData): Promise<QuizKategoriMedSporsmal> {
    // Sjekk at kategori eksisterer
    await this.getKategoriById(id);

    // Valider at hovedkategori eksisterer hvis oppgitt
    if (data.hovedkategoriId) {
      const hovedkategori = await this.prisma.quizKategori.findUnique({
        where: { id: data.hovedkategoriId }
      });
      
      if (!hovedkategori) {
        throw new ValidationError('Hovedkategori ikke funnet');
      }

      // Ikke tillat sirkulære referanser
      if (data.hovedkategoriId === id) {
        throw new ValidationError('En kategori kan ikke være sin egen hovedkategori');
      }
    }

    logger.info('Oppdaterer quiz kategori', { id, data });

    return this.prisma.quizKategori.update({
      where: { id },
      data,
      include: {
        underkategorier: true,
        hovedkategori: true,
        _count: {
          select: { sporsmal: true }
        }
      }
    });
  }

  async deleteKategori(id: number): Promise<void> {
    // Sjekk at kategori eksisterer
    await this.getKategoriById(id);

    // Sjekk om kategori har spørsmål eller underkategorier
    const kategoriMedRelasjoner = await this.prisma.quizKategori.findUnique({
      where: { id },
      include: {
        sporsmal: true,
        underkategorier: true
      }
    });

    if (kategoriMedRelasjoner?.sporsmal.length || kategoriMedRelasjoner?.underkategorier.length) {
      throw new ValidationError('Kan ikke slette kategori som har spørsmål eller underkategorier');
    }

    logger.info('Sletter quiz kategori', { id });

    await this.prisma.quizKategori.delete({
      where: { id }
    });
  }

  // Quiz spørsmål
  async getSporsmal(filter: {
    klasse?: string;
    kategoriId?: number;
    limit?: number;
    offset?: number;
  }): Promise<QuizSporsmalMedKategori[]> {
    const { klasse, kategoriId, limit, offset } = filter;
    
    const where: any = {};
    if (klasse) {
      where.klasser = { has: klasse };
    }
    if (kategoriId) {
      where.kategoriId = kategoriId;
    }

    logger.info('Henter quiz spørsmål', { filter });

    return this.prisma.quizSporsmal.findMany({
      where,
      include: {
        kategori: true
      },
      orderBy: { id: 'asc' },
      take: limit,
      skip: offset
    });
  }

  async getSporsmalById(id: number): Promise<QuizSporsmalMedKategori> {
    const sporsmal = await this.prisma.quizSporsmal.findUnique({
      where: { id },
      include: {
        kategori: true
      }
    });

    if (!sporsmal) {
      throw new NotFoundError('Quiz spørsmål ikke funnet');
    }

    return sporsmal;
  }

  async createSporsmal(data: CreateQuizSporsmalData): Promise<QuizSporsmalMedKategori> {
    // Valider at kategori eksisterer hvis oppgitt
    if (data.kategoriId) {
      await this.getKategoriById(data.kategoriId);
    }

    // Valider at riktigSvar indeks er gyldig
    if (data.riktigSvar >= data.svaralternativer.length) {
      throw new ValidationError('Riktig svar indeks må være innenfor svaralternativer array');
    }

    logger.info('Oppretter quiz spørsmål', { 
      tekst: data.tekst.substring(0, 50) + '...', 
      klasser: data.klasser,
      kategoriId: data.kategoriId 
    });

    return this.prisma.quizSporsmal.create({
      data,
      include: {
        kategori: true
      }
    });
  }

  async updateSporsmal(id: number, data: UpdateQuizSporsmalData): Promise<QuizSporsmalMedKategori> {
    // Sjekk at spørsmål eksisterer
    const eksisterendeSporsmal = await this.getSporsmalById(id);

    // Valider at kategori eksisterer hvis oppgitt
    if (data.kategoriId) {
      await this.getKategoriById(data.kategoriId);
    }

    // Valider at riktigSvar indeks er gyldig hvis begge er oppgitt
    const svaralternativer = data.svaralternativer || eksisterendeSporsmal.svaralternativer;
    const riktigSvar = data.riktigSvar !== undefined ? data.riktigSvar : eksisterendeSporsmal.riktigSvar;
    
    if (riktigSvar >= svaralternativer.length) {
      throw new ValidationError('Riktig svar indeks må være innenfor svaralternativer array');
    }

    logger.info('Oppdaterer quiz spørsmål', { id, kategorier: data.klasser?.length });

    return this.prisma.quizSporsmal.update({
      where: { id },
      data,
      include: {
        kategori: true
      }
    });
  }

  async deleteSporsmal(id: number): Promise<void> {
    // Sjekk at spørsmål eksisterer
    await this.getSporsmalById(id);

    logger.info('Sletter quiz spørsmål', { id });

    await this.prisma.quizSporsmal.delete({
      where: { id }
    });
  }

  // Quiz statistikk og analyse
  async getQuizStatistikk(klasse?: string): Promise<{
    totaltAntallSporsmal: number;
    sporsmalPerKategori: { kategori: string; antall: number }[];
    sporsmalPerKlasse: { klasse: string; antall: number }[];
  }> {
    const where = klasse ? { klasser: { has: klasse } } : {};

    const [totaltAntallSporsmal, kategorier, alleSporsmal] = await Promise.all([
      this.prisma.quizSporsmal.count({ where }),
      this.prisma.quizKategori.findMany({
        include: {
          _count: {
            select: { sporsmal: true }
          }
        }
      }),
      this.prisma.quizSporsmal.findMany({
        where,
        select: { klasser: true }
      })
    ]);

    // Grupper spørsmål per kategori
    const sporsmalPerKategori = kategorier.map(k => ({
      kategori: k.navn,
      antall: k._count.sporsmal
    }));

    // Grupper spørsmål per klasse
    const klasseMap = new Map<string, number>();
    alleSporsmal.forEach(s => {
      s.klasser.forEach(klasse => {
        klasseMap.set(klasse, (klasseMap.get(klasse) || 0) + 1);
      });
    });

    const sporsmalPerKlasse = Array.from(klasseMap.entries()).map(([klasse, antall]) => ({
      klasse,
      antall
    }));

    return {
      totaltAntallSporsmal,
      sporsmalPerKategori,
      sporsmalPerKlasse
    };
  }

  // Tilfeldig quiz generering
  async genererTilfeldigQuiz(options: {
    klasse?: string;
    kategoriId?: number;
    antallSporsmal: number;
    ekskluderSporsmalIds?: number[];
  }): Promise<QuizSporsmalMedKategori[]> {
    const { klasse, kategoriId, antallSporsmal, ekskluderSporsmalIds = [] } = options;

    const where: any = {};
    if (klasse) {
      where.klasser = { has: klasse };
    }
    if (kategoriId) {
      where.kategoriId = kategoriId;
    }
    if (ekskluderSporsmalIds.length > 0) {
      where.id = { notIn: ekskluderSporsmalIds };
    }

    // Hent alle tilgjengelige spørsmål
    const alleSporsmal = await this.prisma.quizSporsmal.findMany({
      where,
      include: {
        kategori: true
      }
    });

    if (alleSporsmal.length < antallSporsmal) {
      throw new ValidationError(`Ikke nok spørsmål tilgjengelig. Fant ${alleSporsmal.length}, trenger ${antallSporsmal}`);
    }

    // Bland og velg tilfeldig
    const blandede = alleSporsmal.sort(() => Math.random() - 0.5);
    return blandede.slice(0, antallSporsmal);
  }
} 