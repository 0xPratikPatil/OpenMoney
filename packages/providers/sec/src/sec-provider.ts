import { AbstractProvider } from "@openmoney/provider-core";
import { SECCikMapFetcher } from "./models/cik-map";
import { SECCompanyFilingsFetcher } from "./models/company-filings";
import { SECCompareCompanyFactsFetcher } from "./models/compare-company-facts";
import { SECEquityFtdFetcher } from "./models/equity-ftd";
import { SECEquitySearchFetcher } from "./models/equity-search";
import { SECForm13FHRFetcher } from "./models/form-13FHR";
import { SECHtmFileFetcher } from "./models/htm-file";
import { SECInsiderTradingFetcher } from "./models/insider-trading";
import { SECInstitutionsSearchFetcher } from "./models/institutions-search";
import { SECLatestFinancialReportsFetcher } from "./models/latest-financial-reports";
import { SECManagementDiscussionAnalysisFetcher } from "./models/management-discussion-analysis";
import { SECNportDisclosureFetcher } from "./models/nport-disclosure";
import { SECRssLitigationFetcher } from "./models/rss-litigation";
import { SECSchemaFilesFetcher } from "./models/schema-files";
import { SECSecFilingFetcher } from "./models/sec-filing";
import { SECSicSearchFetcher } from "./models/sic-search";
import { SECSymbolMapFetcher } from "./models/symbol-map";

/**
 * SEC EDGAR provider — free SEC filing data.
 * Maps tickers to CIKs, fetches company filings, XBRL financial data,
 * insider trading (Form 4), institutional holdings (13F-HR),
 * N-PORT disclosures, litigation releases, and more.
 *
 * Note: SEC requires a User-Agent header in the format "CompanyName (contact@company.com)".
 * Rate limits may apply for high-volume scraping.
 *
 * Registered fetchers: 17 models.
 */
export const secProvider = new AbstractProvider({
  name: "sec",
  description:
    "SEC EDGAR provides access to corporate filings, insider trading data, institutional holdings, XBRL financial facts, and litigation releases from the U.S. Securities and Exchange Commission.",
  website: "https://www.sec.gov/edgar",
  credentials: [],
  reprName: "SEC EDGAR",
  instructions:
    "No API key required. SEC requires a valid User-Agent header. Free access but rate-limited. Supports CIK-based queries and ticker-to-CIK mapping.",
  fetcherMap: {
    "cik_map": new SECCikMapFetcher(),
    "company_filings": new SECCompanyFilingsFetcher(),
    "compare_company_facts": new SECCompareCompanyFactsFetcher(),
    "equity_ftd": new SECEquityFtdFetcher(),
    "equity_search": new SECEquitySearchFetcher(),
    "form_13FHR": new SECForm13FHRFetcher(),
    "htm_file": new SECHtmFileFetcher(),
    "insider_trading": new SECInsiderTradingFetcher(),
    "institutions_search": new SECInstitutionsSearchFetcher(),
    "latest_financial_reports": new SECLatestFinancialReportsFetcher(),
    "management_discussion_analysis": new SECManagementDiscussionAnalysisFetcher(),
    "nport_disclosure": new SECNportDisclosureFetcher(),
    "rss_litigation": new SECRssLitigationFetcher(),
    "schema_files": new SECSchemaFilesFetcher(),
    "sec_filing": new SECSecFilingFetcher(),
    "sic_search": new SECSicSearchFetcher(),
    "symbol_map": new SECSymbolMapFetcher(),
  },
});
