# Telegram Bot Setup Instructions

## 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Choose a name for your bot (e.g., "CarMarket Support Bot")
4. Choose a username for your bot (must end with 'bot', e.g., "carmarket_support_bot")
5. Copy the **Bot Token** that BotFather gives you

## 2. Get Your Chat ID

### Method 1: Using @userinfobot
1. Search for `@userinfobot` in Telegram
2. Send `/start` to the bot
3. Copy your **Chat ID** (it will be a number like `123456789`)

### Method 2: Using @getidsbot
1. Search for `@getidsbot` in Telegram
2. Send `/start` to the bot
3. Copy your **Chat ID**

## 3. Configure Environment Variables

Add these variables to your `backend/.env` file:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

## 4. Test the Setup

1. Start your backend server: `cd backend && npm start`
2. Go to your Support page: `http://localhost:3000/support`
3. Fill out the form and submit
4. Check your Telegram for the message

## 5. Message Format

When someone submits the support form, you'll receive a message like this:

```
🚨 New Support Request

👤 Name: John Doe
📧 Email: john@example.com
📝 Subject: Car listing issue
💬 Message: I can't upload images for my car listing
⏰ Timestamp: December 19, 2024, 10:30:45 AM
```

## Troubleshooting

- **Bot Token Invalid**: Make sure you copied the token correctly from BotFather
- **Chat ID Invalid**: Make sure you got your Chat ID from @userinfobot or @getidsbot
- **Message Not Received**: Check if the bot is started by sending `/start` to your bot
- **Server Error**: Check the backend logs for detailed error messages

## Security Notes

- Never commit your `.env` file to version control
- Keep your Bot Token secret
- Consider using environment-specific tokens for production
