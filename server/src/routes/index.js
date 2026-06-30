const express = require('express');
const leadsRoutes = require('./leads.routes');
const dashboardRoutes = require('./dashboard.routes');
const needAttentionRoutes = require('./needAttention.routes');
const reportsRoutes = require('./reports.routes');
const settingsRoutes = require('./settings.routes');
const usersRoutes = require('./users.routes');
const notificationsRoutes = require('./notifications.routes');
const propertiesRoutes = require('./properties.routes');
const publicRoutes = require('./public.routes');
const cronRoutes = require('./cron.routes');

const router = express.Router();

router.get('/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }));

router.use('/leads', leadsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/need-attention', needAttentionRoutes);
router.use('/reports', reportsRoutes);
router.use('/settings', settingsRoutes);
router.use('/users', usersRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/properties', propertiesRoutes);
router.use('/public', publicRoutes);
router.use('/cron', cronRoutes);

module.exports = router;
