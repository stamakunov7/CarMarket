# How I Set Up Telegram Bot to Receive Messages from Support Page

## Why I Needed This

I wanted to receive messages from users who submit the Support form on my website directly in my Telegram. This allows me to quickly respond to user questions and not miss important inquiries.

## What I Did

### 1. Created a Telegram Bot

1. Opened Telegram and found `@BotFather`
2. Sent `/newbot` command
3. Chose bot name: "CarMarket Support Bot"
4. Chose username: `carmarket_support_bot` (must end with 'bot')
5. Copied the **Bot Token** that BotFather provided

### 2. Got My Chat ID

1. Found `@userinfobot` in Telegram
2. Sent `/start` to the bot
3. Copied my **Chat ID** (it's a number like `123456789`)

### 3. Configured Environment Variables

Added to `backend/.env` file:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=123456789
```

### 4. Implemented Message Sending in Code

In `backend/index.js` I added:

```javascript
// Telegram Bot configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || 'activeuser7';

// Function to send message to Telegram
async function sendTelegramMessage(message) {
  if (!TELEGRAM_BOT_TOKEN) {
    logger.warn('Telegram Bot Token not configured');
    return { success: false, error: 'Telegram Bot Token not configured' };
  }

  try {
    const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });

    logger.info('Message sent to Telegram successfully');
    return { success: true, data: response.data };
  } catch (error) {
    logger.error('Failed to send message to Telegram:', error.message);
    return { success: false, error: error.message };
  }
}
```

### 5. Set Up Support Form Endpoint

Added POST request handler for `/api/support`:

```javascript
app.post('/api/support', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Format message for Telegram
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const telegramMessage = `
🚨 <b>New Support Request</b>

👤 <b>Name:</b> ${name}
📧 <b>Email:</b> ${email}
📝 <b>Subject:</b> ${subject}
💬 <b>Message:</b> ${message}
⏰ <b>Timestamp:</b> ${timestamp}
    `.trim();

    // Send to Telegram
    const telegramResult = await sendTelegramMessage(telegramMessage);

    if (telegramResult.success) {
      logger.info(`Support message sent successfully for ${email}`);
      res.json({
        success: true,
        message: 'Your message has been sent successfully! We will get back to you soon.'
      });
    } else {
      logger.error('Failed to send support message to Telegram:', telegramResult.error);
      res.status(500).json({
        success: false,
        error: 'Failed to send message. Please try again later.'
      });
    }
  } catch (error) {
    logger.error('Support form error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
```

## How It Works

1. User fills out the form on Support page
2. Form sends POST request to `/api/support`
3. Server validates the data
4. Formats message with emojis and HTML markup
5. Sends message to Telegram via API
6. Returns confirmation to user

## Result

Now when someone submits a message through the Support page, I receive a beautifully formatted message in Telegram:

![Telegram Bot Messages](./screenshots/telegram-bot.png)

The message contains:
- 🚨 "New Support Request" header
- 👤 User's name
- 📧 Email
- 📝 Subject
- 💬 Message content
- ⏰ Timestamp

## Testing the Setup

1. Start the server: `cd backend && npm start`
2. Go to Support page: `http://localhost:3000/support`
3. Fill out the form and submit
4. Check Telegram - message arrives instantly!

## Troubleshooting

- **Bot Token doesn't work**: Make sure you copied the token correctly from BotFather
- **Chat ID is wrong**: Ensure you got the correct ID from @userinfobot
- **Messages not received**: Check that the bot is started (send `/start` to your bot)
- **Server error**: Check logs in `backend/logs/error.log`

## Security Notes

- Never commit `.env` file to git
- Keep Bot Token secret
- Use separate tokens for production
