# Bank App (Testing) — Meezan-style demo

A demo mobile banking app built with **Expo / React Native**. The home screen
is styled to match a Meezan-style layout (purple header, "SHOW BALANCE",
Share / Transactions buttons, and a feature tile grid).

> ⚠️ This is a **demo/testing app with fake data only**. It is not connected to
> any real bank and moves no real money. It is for learning and UI testing.

## What actually has logic (not just a dummy)

- **Account details** — account title, account number and IBAN.
- **Live balance** — starts at a seed value and updates on every transaction.
- **Unique Transaction ID on every transaction** — e.g. `TXN-20260715-8F3K9Q2A`,
  plus a unique 12-digit reference number. Generated fresh each time in
  `src/context/AccountContext.js` (`generateTxnId` / `generateReference`).
- **Send Money flow** — validates the amount, checks for sufficient balance,
  deducts it, records the transaction, and shows a receipt with the new ID.
- **Transaction history** — every transaction is listed with its unique ID.
- **Persistence** — data is saved on the phone with AsyncStorage, so it
  survives closing/reopening the app.

## Project structure

```
App.js                         Navigation (Home, Transactions, SendMoney, Receipt)
index.js                       Expo entry point
src/theme.js                   Colors + spacing
src/context/AccountContext.js  All the logic: balance, transactions, unique IDs
src/screens/HomeScreen.js      The screenshot-style home screen
src/screens/SendMoneyScreen.js Send money form
src/screens/ReceiptScreen.js   Success receipt with the unique Transaction ID
src/screens/TransactionsScreen.js  History list
```

---

## How to run it on your phone

You need a computer with **Node.js 18+** installed. Then:

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npx expo start
```

A **QR code** appears in the terminal.

### Option A — Instant test (recommended first)
1. Install the **"Expo Go"** app from the Google Play Store on your Android phone.
2. Open Expo Go → **Scan QR Code** → scan the QR from the terminal.
3. The app opens live on your phone. Any code change reloads instantly.

### Option B — Build a real installable `.apk`
1. Create a free account at **https://expo.dev**.
2. Install the build tool and log in:
   ```bash
   npm install -g eas-cli
   eas login
   ```
3. Configure once, then build in the cloud:
   ```bash
   eas build:configure
   eas build -p android --profile preview
   ```
4. When it finishes, Expo gives you a **download link to a `.apk`**.
   Open that link on your phone, download, and tap the file to install.
   (You may need to allow "Install from unknown sources".)

> The `preview` profile produces an APK you can sideload. The default
> production profile produces an `.aab` for the Play Store instead.

---

## Reset the demo data

Uninstalling the app (or clearing its storage) resets the balance and
transactions back to the seed values in `src/context/AccountContext.js`.
