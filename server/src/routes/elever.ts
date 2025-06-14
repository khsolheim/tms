import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken, sjekkRolle, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// Hent alle elever for en bedrift
router.get("/bedrift/:bedriftId/elever", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bedriftId = parseInt(req.params.bedriftId);
    
    const elever = await prisma.elev.findMany({
      where: { bedriftId },
      orderBy: { opprettet: 'desc' }
    });
    
    res.json(elever);
  } catch (e) {
    console.error('Feil ved henting av elever:', e);
    res.status(500).json({ error: "Kunne ikke hente elever" });
  }
});

// Hent alle søknader for en bedrift
router.get("/bedrift/:bedriftId/elevsoknad", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bedriftId = parseInt(req.params.bedriftId);
    
    const soknader = await prisma.elevSoknad.findMany({
      where: { bedriftId },
      orderBy: { opprettet: 'desc' }
    });
    
    res.json(soknader);
  } catch (e) {
    console.error('Feil ved henting av søknader:', e);
    res.status(500).json({ error: "Kunne ikke hente søknader" });
  }
});

// Send søknad om tilgang (offentlig endepunkt)
router.post("/elev/soknad", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fornavn,
      etternavn,
      telefon,
      epost,
      gate,
      postnummer,
      poststed,
      personnummer,
      bedriftId,
      klassekode,
      larer
    } = req.body;

    // Valider at alle obligatoriske felt er fylt ut
    if (!fornavn || !etternavn || !telefon || !epost || !gate || !postnummer || 
        !poststed || !personnummer || !bedriftId || !klassekode) {
      res.status(400).json({ error: "Alle obligatoriske felt må fylles ut" });
      return;
    }

    // Sjekk om eleven allerede eksisterer
    const eksisterendeElev = await prisma.elev.findFirst({
      where: {
        OR: [
          { epost },
          { personnummer }
        ]
      }
    });

    if (eksisterendeElev) {
      res.status(400).json({ error: "En elev med denne e-posten eller personnummeret eksisterer allerede" });
      return;
    }

    // Sjekk om det allerede finnes en pending søknad
    const eksisterendeSoknad = await prisma.elevSoknad.findFirst({
      where: {
        OR: [
          { epost },
          { personnummer }
        ],
        status: 'PENDING'
      }
    });

    if (eksisterendeSoknad) {
      res.status(400).json({ error: "Du har allerede en pending søknad" });
      return;
    }

    // Opprett søknad
    const soknad = await prisma.elevSoknad.create({
      data: {
        fornavn,
        etternavn,
        telefon,
        epost,
        gate,
        postnummer,
        poststed,
        personnummer,
        bedriftId,
        klassekode,
        larer: larer || null
      }
    });

    res.status(201).json(soknad);
  } catch (e) {
    console.error('Feil ved opprettelse av søknad:', e);
    res.status(500).json({ error: "Kunne ikke sende søknad" });
  }
});

// Behandle søknad (godkjenn/avvis)
router.put("/elevsoknad/:soknadId", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const soknadId = parseInt(req.params.soknadId);
    const { status } = req.body;

    if (!['GODKJENT', 'AVVIST'].includes(status)) {
      res.status(400).json({ error: "Ugyldig status" });
      return;
    }

    const soknad = await prisma.elevSoknad.findUnique({
      where: { id: soknadId }
    });

    if (!soknad) {
      res.status(404).json({ error: "Søknad ikke funnet" });
      return;
    }

    // Oppdater søknad
    const oppdatertSoknad = await prisma.elevSoknad.update({
      where: { id: soknadId },
      data: { status }
    });

    // Hvis godkjent, opprett elev
    if (status === 'GODKJENT') {
      await prisma.elev.create({
        data: {
          fornavn: soknad.fornavn,
          etternavn: soknad.etternavn,
          telefon: soknad.telefon,
          epost: soknad.epost,
          gate: soknad.gate,
          postnummer: soknad.postnummer,
          poststed: soknad.poststed,
          personnummer: soknad.personnummer,
          klassekode: soknad.klassekode,
          larer: soknad.larer,
          bedriftId: soknad.bedriftId,
          status: 'AKTIV'
        }
      });
    }

    res.json(oppdatertSoknad);
  } catch (e) {
    console.error('Feil ved behandling av søknad:', e);
    res.status(500).json({ error: "Kunne ikke behandle søknad" });
  }
});

// Opprett elev direkte (for bedrifter)
router.post("/bedrift/:bedriftId/elev", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bedriftId = parseInt(req.params.bedriftId);
    const {
      fornavn,
      etternavn,
      telefon,
      epost,
      gate,
      postnummer,
      poststed,
      personnummer,
      klassekode,
      larer,
      status
    } = req.body;

    // Valider at alle obligatoriske felt er fylt ut
    if (!fornavn || !etternavn || !telefon || !epost || !gate || !postnummer || 
        !poststed || !personnummer || !klassekode) {
      res.status(400).json({ error: "Alle obligatoriske felt må fylles ut" });
      return;
    }

    // Sjekk om eleven allerede eksisterer
    const eksisterendeElev = await prisma.elev.findFirst({
      where: {
        OR: [
          { epost },
          { personnummer }
        ]
      }
    });

    if (eksisterendeElev) {
      res.status(400).json({ error: "En elev med denne e-posten eller personnummeret eksisterer allerede" });
      return;
    }

    // Opprett elev
    const elev = await prisma.elev.create({
      data: {
        fornavn,
        etternavn,
        telefon,
        epost,
        gate,
        postnummer,
        poststed,
        personnummer,
        klassekode,
        larer: larer || null,
        status: status || 'AKTIV',
        bedriftId
      }
    });

    res.status(201).json(elev);
  } catch (e) {
    console.error('Feil ved opprettelse av elev:', e);
    res.status(500).json({ error: "Kunne ikke opprette elev" });
  }
});

// Oppdater elev
router.put("/elev/:elevId", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const elevId = parseInt(req.params.elevId);
    const {
      fornavn,
      etternavn,
      telefon,
      epost,
      gate,
      postnummer,
      poststed,
      personnummer,
      klassekode,
      larer,
      status
    } = req.body;

    const elev = await prisma.elev.findUnique({
      where: { id: elevId }
    });

    if (!elev) {
      res.status(404).json({ error: "Elev ikke funnet" });
      return;
    }

    // Sjekk om e-post eller personnummer er i bruk av andre
    if (epost !== elev.epost || personnummer !== elev.personnummer) {
      const eksisterendeElev = await prisma.elev.findFirst({
        where: {
          AND: [
            { id: { not: elevId } },
            {
              OR: [
                { epost },
                { personnummer }
              ]
            }
          ]
        }
      });

      if (eksisterendeElev) {
        res.status(400).json({ error: "E-post eller personnummer er allerede i bruk" });
        return;
      }
    }

    // Oppdater elev
    const oppdatertElev = await prisma.elev.update({
      where: { id: elevId },
      data: {
        fornavn,
        etternavn,
        telefon,
        epost,
        gate,
        postnummer,
        poststed,
        personnummer,
        klassekode,
        larer: larer || null,
        status
      }
    });

    res.json(oppdatertElev);
  } catch (e) {
    console.error('Feil ved oppdatering av elev:', e);
    res.status(500).json({ error: "Kunne ikke oppdatere elev" });
  }
});

// Slett elev
router.delete("/elev/:elevId", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const elevId = parseInt(req.params.elevId);

    const elev = await prisma.elev.findUnique({
      where: { id: elevId }
    });

    if (!elev) {
      res.status(404).json({ error: "Elev ikke funnet" });
      return;
    }

    await prisma.elev.delete({
      where: { id: elevId }
    });

    res.json({ message: "Elev slettet" });
  } catch (e) {
    console.error('Feil ved sletting av elev:', e);
    res.status(500).json({ error: "Kunne ikke slette elev" });
  }
});

export default router; 