import { AbstractProvider } from "@openmoney/provider-core";
import { GovUSTreasuryAuctionsFetcher } from "./models/treasury-auctions";
import { GovUSTreasuryPricesFetcher } from "./models/treasury-prices";
import { GovUSCommodityPsdDataFetcher } from "./models/commodity-psd-data";
import { GovUSCommodityPsdReportFetcher } from "./models/commodity-psd-report";
import { GovUSWeatherBulletinFetcher } from "./models/weather-bulletin";
import { GovUSWeatherBulletinDownloadFetcher } from "./models/weather-bulletin-download";

/**
 * US Government data provider — Treasury, USDA, NWS.
 * All data is free and publicly available without API keys.
 *
 * Registered fetchers: 6 models.
 */
export const governmentUsProvider = new AbstractProvider({
  name: "government_us",
  description:
    "US Government data provider offering Treasury auction results and security prices, USDA PSD (Production, Supply, Distribution) commodity reports, and National Weather Service bulletins.",
  website: "https://www.treasurydirect.gov",
  credentials: [],
  reprName: "US Government",
  instructions:
    "No API key required. All data is from free US government public APIs including TreasuryDirect, USDA, and NWS.",
  fetcherMap: {
    "treasury_auctions": new GovUSTreasuryAuctionsFetcher(),
    "treasury_prices": new GovUSTreasuryPricesFetcher(),
    "commodity_psd_data": new GovUSCommodityPsdDataFetcher(),
    "commodity_psd_report": new GovUSCommodityPsdReportFetcher(),
    "weather_bulletin": new GovUSWeatherBulletinFetcher(),
    "weather_bulletin_download": new GovUSWeatherBulletinDownloadFetcher(),
  },
});
