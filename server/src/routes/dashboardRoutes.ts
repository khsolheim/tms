import { Router } from 'express';
import { dashboardService } from '../services/dashboardService';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorization';

const router = Router();

// Admin Dashboard Routes
router.get('/admin/stats', 
  authenticateToken, 
  authorize(['ADMIN', 'SYSTEM_ADMIN']), 
  async (req, res) => {
    try {
      const stats = await dashboardService.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch admin dashboard statistics' });
    }
  }
);

router.get('/admin/activities', 
  authenticateToken, 
  authorize(['ADMIN', 'SYSTEM_ADMIN']), 
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await dashboardService.getAdminRecentActivity(limit);
      res.json(activities);
    } catch (error) {
      console.error('Error fetching admin activities:', error);
      res.status(500).json({ error: 'Failed to fetch admin activities' });
    }
  }
);

// Company Dashboard Routes
router.get('/bedrift/stats', 
  authenticateToken, 
  authorize(['HOVEDBRUKER', 'ADMIN', 'TRAFIKKLARER']), 
  async (req, res) => {
    try {
      const bedriftId = req.user?.bedriftId;
      if (!bedriftId) {
        return res.status(400).json({ error: 'BedriftId is required' });
      }
      
      const stats = await dashboardService.getBedriftDashboardStats(bedriftId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching bedrift dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch company dashboard statistics' });
    }
  }
);

router.get('/bedrift/activities', 
  authenticateToken, 
  authorize(['HOVEDBRUKER', 'ADMIN', 'TRAFIKKLARER']), 
  async (req, res) => {
    try {
      const bedriftId = req.user?.bedriftId;
      if (!bedriftId) {
        return res.status(400).json({ error: 'BedriftId is required' });
      }
      
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await dashboardService.getBedriftRecentActivity(bedriftId, limit);
      res.json(activities);
    } catch (error) {
      console.error('Error fetching bedrift activities:', error);
      res.status(500).json({ error: 'Failed to fetch company activities' });
    }
  }
);

router.get('/bedrift/upcoming-events', 
  authenticateToken, 
  authorize(['HOVEDBRUKER', 'ADMIN', 'TRAFIKKLARER']), 
  async (req, res) => {
    try {
      const bedriftId = req.user?.bedriftId;
      if (!bedriftId) {
        return res.status(400).json({ error: 'BedriftId is required' });
      }
      
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await dashboardService.getBedriftUpcomingEvents(bedriftId, limit);
      res.json(events);
    } catch (error) {
      console.error('Error fetching bedrift upcoming events:', error);
      res.status(500).json({ error: 'Failed to fetch upcoming events' });
    }
  }
);

// Student Dashboard Routes
router.get('/elev/stats', 
  authenticateToken, 
  authorize(['ELEV']), 
  async (req, res) => {
    try {
      const elevId = req.user?.elevId;
      if (!elevId) {
        return res.status(400).json({ error: 'ElevId is required' });
      }
      
      const stats = await dashboardService.getElevDashboardStats(elevId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching elev dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch student dashboard statistics' });
    }
  }
);

router.get('/elev/activities', 
  authenticateToken, 
  authorize(['ELEV']), 
  async (req, res) => {
    try {
      const elevId = req.user?.elevId;
      if (!elevId) {
        return res.status(400).json({ error: 'ElevId is required' });
      }
      
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await dashboardService.getElevRecentActivity(elevId, limit);
      res.json(activities);
    } catch (error) {
      console.error('Error fetching elev activities:', error);
      res.status(500).json({ error: 'Failed to fetch student activities' });
    }
  }
);

router.get('/elev/upcoming-lessons', 
  authenticateToken, 
  authorize(['ELEV']), 
  async (req, res) => {
    try {
      const elevId = req.user?.elevId;
      if (!elevId) {
        return res.status(400).json({ error: 'ElevId is required' });
      }
      
      const limit = parseInt(req.query.limit as string) || 10;
      const lessons = await dashboardService.getElevUpcomingLessons(elevId, limit);
      res.json(lessons);
    } catch (error) {
      console.error('Error fetching elev upcoming lessons:', error);
      res.status(500).json({ error: 'Failed to fetch upcoming lessons' });
    }
  }
);

router.get('/elev/achievements', 
  authenticateToken, 
  authorize(['ELEV']), 
  async (req, res) => {
    try {
      const elevId = req.user?.elevId;
      if (!elevId) {
        return res.status(400).json({ error: 'ElevId is required' });
      }
      
      const limit = parseInt(req.query.limit as string) || 5;
      const achievements = await dashboardService.getElevRecentAchievements(elevId, limit);
      res.json(achievements);
    } catch (error) {
      console.error('Error fetching elev achievements:', error);
      res.status(500).json({ error: 'Failed to fetch student achievements' });
    }
  }
);

router.get('/elev/sikkerhetskontroll-progress', 
  authenticateToken, 
  authorize(['ELEV']), 
  async (req, res) => {
    try {
      const elevId = req.user?.elevId;
      if (!elevId) {
        return res.status(400).json({ error: 'ElevId is required' });
      }
      
      const progress = await dashboardService.getElevSikkerhetskontrollProgress(elevId);
      res.json(progress);
    } catch (error) {
      console.error('Error fetching elev sikkerhetskontroll progress:', error);
      res.status(500).json({ error: 'Failed to fetch safety control progress' });
    }
  }
);

// Legacy routes for backward compatibility
router.get('/dashboard/stats', 
  authenticateToken, 
  async (req, res) => {
    try {
      const userRole = req.user?.rolle;
      const bedriftId = req.user?.bedriftId;
      
      if (userRole === 'ADMIN' || userRole === 'SYSTEM_ADMIN') {
        const stats = await dashboardService.getAdminDashboardStats();
        res.json(stats);
      } else if (bedriftId && (userRole === 'HOVEDBRUKER' || userRole === 'TRAFIKKLARER')) {
        const stats = await dashboardService.getBedriftDashboardStats(bedriftId);
        res.json(stats);
      } else {
        res.status(403).json({ error: 'Unauthorized' });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  }
);

router.get('/dashboard/activities', 
  authenticateToken, 
  async (req, res) => {
    try {
      const userRole = req.user?.rolle;
      const bedriftId = req.user?.bedriftId;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (userRole === 'ADMIN' || userRole === 'SYSTEM_ADMIN') {
        const activities = await dashboardService.getAdminRecentActivity(limit);
        res.json(activities);
      } else if (bedriftId && (userRole === 'HOVEDBRUKER' || userRole === 'TRAFIKKLARER')) {
        const activities = await dashboardService.getBedriftRecentActivity(bedriftId, limit);
        res.json(activities);
      } else {
        res.status(403).json({ error: 'Unauthorized' });
      }
    } catch (error) {
      console.error('Error fetching dashboard activities:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard activities' });
    }
  }
);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'dashboard-api' 
  });
});

export { router as dashboardRoutes };