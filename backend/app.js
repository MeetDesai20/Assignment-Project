require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var bodyParser = require('body-parser');

// Import routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const authRoutes = require('./routes/api/auth');
const userRoutes = require('./routes/api/users');
const scoreRoutes = require('./routes/api/scores');
const charityRoutes = require('./routes/api/charities');
const winnerRoutes = require('./routes/api/winners');
const drawRoutes = require('./routes/api/draws');
const subscriptionRoutes = require('./routes/api/subscriptions');
const subscriptionController = require('./controllers/subscriptionController');
const errorHandler = require('./middleware/errorHandler');

var app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(logger('dev'));
app.post('/api/subscriptions/webhook', bodyParser.raw({ type: 'application/json' }), subscriptionController.handleWebhook);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/winners', winnerRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Legacy routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Documentation
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'Digital Heroes Golf Platform API',
    version: '1.0.0',
    endpoints: {
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        getCurrentUser: 'GET /api/auth/me',
      },
      users: {
        getProfile: 'GET /api/users/profile',
        updateProfile: 'PUT /api/users/profile',
        getAllUsers: 'GET /api/users (admin)',
        getUserById: 'GET /api/users/:userId (admin)',
      },
      scores: {
        addScore: 'POST /api/scores',
        getScores: 'GET /api/scores',
        getScore: 'GET /api/scores/:scoreId',
        updateScore: 'PUT /api/scores/:scoreId',
        deleteScore: 'DELETE /api/scores/:scoreId',
      },
      charities: {
        getAll: 'GET /api/charities',
        getFeatured: 'GET /api/charities/featured',
        getById: 'GET /api/charities/:charityId',
        create: 'POST /api/charities (admin)',
        update: 'PUT /api/charities/:charityId (admin)',
      },
      draws: {
        getCurrentDraw: 'GET /api/draws/current',
        getResults: 'GET /api/draws/:drawId/results',
        create: 'POST /api/draws (admin)',
        simulate: 'POST /api/draws/:drawId/simulate (admin)',
        publish: 'POST /api/draws/:drawId/publish (admin)',
      },
      winners: {
        getPendingVerifications: 'GET /api/winners/pending (admin)',
        getUserWinnings: 'GET /api/winners/my-winnings',
        submitProof: 'POST /api/winners/:winnerId/proof',
        verify: 'PUT /api/winners/:winnerId/verify (admin)',
        markAsPaid: 'PUT /api/winners/:winnerId/paid (admin)',
      },
      subscriptions: {
        getCurrent: 'GET /api/subscriptions/current',
        createCheckout: 'POST /api/subscriptions/checkout',
        verify: 'POST /api/subscriptions/verify',
        cancel: 'POST /api/subscriptions/cancel',
        webhook: 'POST /api/subscriptions/webhook',
      },
    },
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404, 'Route not found'));
});

// Error handler
app.use(errorHandler);

module.exports = app;
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
