import { ProviderHttpClient } from "@openmoney/shared";

// ---------------------------------------------------------------------------
// Shared FMP HTTP client
// ---------------------------------------------------------------------------

const fmpClient = new ProviderHttpClient({
  baseUrl: "https://financialmodelingprep.com/api",
  userAgent: "OpenMoney/0.1.0",
  timeout: 30000,
  retry: { maxRetries: 3, baseDelayMs: 1000, maxDelayMs: 10000 },
  cache: { ttlMs: 60000, enabled: true },
  auth: { type: "query", key: "apikey", credentialKey: "fmp_api_key" },
});

// ---------------------------------------------------------------------------
// Backward-compatible fetch wrapper
//
// Model files call  fmpFetch<T>(path, apiKey, params?)  so we keep this
// exact signature.  Internally it delegates to the shared HTTP client.
// ---------------------------------------------------------------------------

export async function fmpFetch<T>(
  path: string,
  apiKey: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  return fmpClient.get<T>(path, params, { fmp_api_key: apiKey });
}

// ---------------------------------------------------------------------------
// Types  (unchanged — kept in this file for backward compatibility)
// ---------------------------------------------------------------------------

export interface FmpQuote {
  symbol: string;
  name?: string;
  price?: number;
  changesPercentage?: number;
  change?: number;
  dayLow?: number;
  dayHigh?: number;
  yearHigh?: number;
  yearLow?: number;
  marketCap?: number;
  volume?: number;
  avgVolume?: number;
  open?: number;
  previousClose?: number;
  eps?: number;
  pe?: number;
  earningsAnnouncement?: string;
  sharesOutstanding?: number;
  timestamp?: number;
}

export interface FmpHistoricalRow {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
  change?: number;
  changePercent?: number;
  vwap?: number;
}

export interface FmpHistoricalResponse {
  symbol: string;
  historical: FmpHistoricalRow[];
}

export interface FmpProfile {
  symbol: string;
  price?: number;
  beta?: number;
  volAvg?: number;
  mktCap?: number;
  lastDiv?: number;
  companyName?: string;
  currency?: string;
  exchange?: string;
  exchangeShortName?: string;
  sector?: string;
  industry?: string;
  website?: string;
  description?: string;
  ceo?: string;
  employees?: number;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  ipoDate?: string;
}

export interface FmpFinancialStatement {
  date: string;
  symbol: string;
  reportedCurrency?: string;
  fillingDate?: string;
  acceptedDate?: string;
  calendarYear?: string;
  period?: string;
  revenue?: number;
  costOfRevenue?: number;
  grossProfit?: number;
  grossProfitRatio?: number;
  researchAndDevelopmentExpenses?: number;
  generalAndAdministrativeExpenses?: number;
  sellingGeneralAndAdministrativeExpenses?: number;
  otherExpenses?: number;
  operatingExpenses?: number;
  costAndExpenses?: number;
  interestExpense?: number;
  depreciationAndAmortization?: number;
  ebitda?: number;
  ebitdaratio?: number;
  operatingIncome?: number;
  operatingIncomeRatio?: number;
  totalOtherIncomeExpensesNet?: number;
  incomeBeforeTax?: number;
  incomeBeforeTaxRatio?: number;
  incomeTaxExpense?: number;
  netIncome?: number;
  netIncomeRatio?: number;
  eps?: number;
  epsdiluted?: number;
  weightedAverageShsOut?: number;
  weightedAverageShsOutDil?: number;
  link?: string;
  finalLink?: string;
  // Balance sheet fields
  cashAndCashEquivalents?: number;
  shortTermInvestments?: number;
  cashAndShortTermInvestments?: number;
  netReceivables?: number;
  inventory?: number;
  otherCurrentAssets?: number;
  totalCurrentAssets?: number;
  propertyPlantEquipmentNet?: number;
  goodwill?: number;
  intangibleAssets?: number;
  goodwillAndIntangibleAssets?: number;
  longTermInvestments?: number;
  taxAssets?: number;
  otherNonCurrentAssets?: number;
  totalNonCurrentAssets?: number;
  totalAssets?: number;
  accountsPayable?: number;
  shortTermDebt?: number;
  taxPayables?: number;
  deferredRevenue?: number;
  otherCurrentLiabilities?: number;
  totalCurrentLiabilities?: number;
  longTermDebt?: number;
  deferredRevenueNonCurrent?: number;
  deferredTaxLiabilitiesNonCurrent?: number;
  otherNonCurrentLiabilities?: number;
  totalNonCurrentLiabilities?: number;
  capitalLeaseObligations?: number;
  totalLiabilities?: number;
  preferredStock?: number;
  commonStock?: number;
  retainedEarnings?: number;
  accumulatedOtherComprehensiveIncomeLoss?: number;
  othertotalStockholdersEquity?: number;
  totalStockholdersEquity?: number;
  totalEquity?: number;
  totalDebt?: number;
  netDebt?: number;
  // Cash flow fields
  deferredIncomeTax?: number;
  stockBasedCompensation?: number;
  changeInWorkingCapital?: number;
  accountsReceivables?: number;
  accountsPayables?: number;
  otherWorkingCapital?: number;
  otherNonCashItems?: number;
  netCashProvidedByOperatingActivities?: number;
  investmentsInPropertyPlantAndEquipment?: number;
  acquisitionsNet?: number;
  purchasesOfInvestments?: number;
  salesMaturitiesOfInvestments?: number;
  otherInvestingActivites?: number;
  netCashUsedForInvestingActivites?: number;
  debtRepayment?: number;
  commonStockIssued?: number;
  commonStockRepurchased?: number;
  dividendsPaid?: number;
  otherFinancingActivities?: number;
  netCashUsedProvidedByFinancingActivities?: number;
  cashAtBeginningOfPeriod?: number;
  cashAtEndOfPeriod?: number;
  operatingCashFlow?: number;
  capitalExpenditure?: number;
  freeCashFlow?: number;
  // Ratio fields
  currentRatio?: number;
  quickRatio?: number;
  cashRatio?: number;
  daysOfSalesOutstanding?: number;
  daysOfInventoryOutstanding?: number;
  operatingCycle?: number;
  daysOfPayablesOutstanding?: number;
  cashConversionCycle?: number;
  grossProfitMargin?: number;
  operatingProfitMargin?: number;
  pretaxProfitMargin?: number;
  netProfitMargin?: number;
  effectiveTaxRate?: number;
  returnOnAssets?: number;
  returnOnEquity?: number;
  returnOnCapitalEmployed?: number;
  netIncomePerEbt?: number;
  ebtPerEbit?: number;
  ebitPerRevenue?: number;
  debtRatio?: number;
  debtEquityRatio?: number;
  longTermDebtToCapitalization?: number;
  totalDebtToCapitalization?: number;
  interestCoverage?: number;
  cashFlowToDebtRatio?: number;
  companyEquityMultiplier?: number;
  receivablesTurnover?: number;
  payablesTurnover?: number;
  inventoryTurnover?: number;
  fixedAssetTurnover?: number;
  assetTurnover?: number;
  operatingCashFlowPerShare?: number;
  freeCashFlowPerShare?: number;
  cashPerShare?: number;
  payoutRatio?: number;
  dividendYield?: number;
  priceToBook?: number;
  priceToSalesRatio?: number;
  priceToEarnings?: number;
  earningsYield?: number;
  enterpriseValueMultiple?: number;
  priceToFreeCashFlowsRatio?: number;
  priceToOperatingCashFlowsRatio?: number;
}
