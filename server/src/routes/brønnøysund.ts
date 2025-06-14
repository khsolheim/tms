import { Router, Request, Response } from 'express';
import { hentBedriftFraBrønnøysund, mapBrønnøysundTilBedrift } from '../services/brønnøysund';

const router = Router();

// Hent bedriftsinformasjon fra Brønnøysundregisteret
// Dette endepunktet er offentlig tilgjengelig for bedrift-registrering
router.get('/bedrift/:organisasjonsnummer', async (req: Request, res: Response): Promise<void> => {
  try {
    const { organisasjonsnummer } = req.params;
    
    if (!organisasjonsnummer) {
      res.status(400).json({ error: 'Organisasjonsnummer er påkrevd' });
      return;
    }

    console.log(`API-kall: Henter bedriftsinformasjon for org.nr: ${organisasjonsnummer}`);

    const brønnøysundData = await hentBedriftFraBrønnøysund(organisasjonsnummer);
    
    if (!brønnøysundData) {
      res.status(404).json({ error: 'Bedrift ikke funnet i Brønnøysundregisteret' });
      return;
    }

    const bedriftData = mapBrønnøysundTilBedrift(brønnøysundData);
    
    res.json({
      success: true,
      data: bedriftData
    });
    
  } catch (error: any) {
    console.error('Feil ved henting av bedriftsinformasjon:', error);
    
    if (error.message.includes('Ugyldig organisasjonsnummer')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ 
        error: 'Kunne ikke hente bedriftsinformasjon fra Brønnøysundregisteret',
        details: error.message
      });
    }
  }
});

export default router; 