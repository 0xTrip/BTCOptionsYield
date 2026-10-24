import { DAY_MS, FEES, NOTICE_DAYS } from "@/config";

export function previewDeposit(amount: number, sharePrice: number) {
  const fee = amount * FEES.deposit;
  const net = amount - fee;
  return { fee, net, shares: net / sharePrice };
}

export function previewWithdraw(shares: number, sharePrice: number, now = Date.now()) {
  const gross = shares * sharePrice;
  const fee = gross * FEES.withdraw;
  return { gross, fee, net: gross - fee, unlockAt: now + NOTICE_DAYS * DAY_MS };
}

/** Short put P&L per contract at expiry */
export function putPnl(price: number, strike: number, premium: number) {
  return premium - Math.max(strike - price, 0);
}

/** Simple annualised premium rate on fully collateralised capital */
export function annualisedPremium(premium: number, strike: number, days: number) {
  return (premium / strike) * (365 / days);
}

/** Lucky Boost tickets: 1 ticket per $1,000 held per day */
export function luckyTickets(balance: number, daysHeld: number) {
  return Math.floor((balance * daysHeld) / 1000);
}
