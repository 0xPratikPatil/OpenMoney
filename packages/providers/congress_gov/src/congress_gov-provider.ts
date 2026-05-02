import { AbstractProvider } from "@openmoney/provider-core";
import { CongressBillsFetcher } from "./models/bills";
import { CongressMembersFetcher } from "./models/members";
import { CongressHearingsFetcher } from "./models/hearings";
import { CongressNominationsFetcher } from "./models/nominations";

/**
 * Congress.gov provider — US legislative data.
 * Provides congressional bills, member info, committee hearings,
 * and presidential nominations.
 *
 * All data is from the public Congress.gov API. No API key required.
 *
 * Registered fetchers: 4 models.
 */
export const congressGovProvider = new AbstractProvider({
  name: "congress_gov",
  description:
    "Congress.gov provides US legislative data including congressional bills, member profiles, committee hearings, and presidential nominations from the Library of Congress.",
  website: "https://api.congress.gov/",
  credentials: [],
  reprName: "Congress.gov",
  instructions:
    "No API key required for public endpoints. Data covers members, bills, hearings, and nominations. Pagination supported via limit/offset.",
  fetcherMap: {
    "bills": new CongressBillsFetcher(),
    "members": new CongressMembersFetcher(),
    "hearings": new CongressHearingsFetcher(),
    "nominations": new CongressNominationsFetcher(),
  },
});
