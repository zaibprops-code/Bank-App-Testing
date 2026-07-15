// ============================================================================
//  BRANDING & ACCOUNT CONFIG  —  edit these to make the app yours.
// ============================================================================
//
//  • bankName:  the text shown in the top bar. Replace with your own brand.
//  • logo:      replace the file at  assets/logo.png  with your own logo
//               (a square PNG, ideally ~512x512). No code change needed.
//  • account:   the demo account details shown on the home card.
//
//  NOTE: This is a demo app with fake data. Do not use a real bank's name or
//  logo — put your own brand here.
// ----------------------------------------------------------------------------

export const branding = {
  bankName: 'Digital Bank', // <-- CHANGE THIS to your own bank/app name
  logo: require('../../assets/logo.png'), // <-- REPLACE assets/logo.png with your logo
};

export const account = {
  title: 'MUHAMMAD ZOHAIB KHAN',
  accountLabel: 'Current Account',
  accountNumber: '0030 1234 5678 90', // 14-digit dummy account (starts with 0030)
  iban: 'PK00 BANK 0030 1234 5678 90',
  branch: 'DIGITAL CENTRE', // <-- CHANGE THIS to your branch name
  openingBalance: 125430.75,
};
