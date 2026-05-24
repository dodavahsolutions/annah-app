// The 32 Scottish council areas. Shared by the lead-capture area picker
// (Sprint A) and the area-guide pages (Sprint B). The richer per-area content
// fields (market notes, scheme availability) are added in Sprint B; for now
// each area carries the stable identity fields.

export interface CouncilArea {
  /** URL-safe identifier, e.g. 'city-of-edinburgh'. */
  slug: string;
  /** Official council area name. */
  name: string;
}

export const COUNCIL_AREAS: readonly CouncilArea[] = [
  { slug: 'aberdeen-city', name: 'Aberdeen City' },
  { slug: 'aberdeenshire', name: 'Aberdeenshire' },
  { slug: 'angus', name: 'Angus' },
  { slug: 'argyll-and-bute', name: 'Argyll and Bute' },
  { slug: 'city-of-edinburgh', name: 'City of Edinburgh' },
  { slug: 'clackmannanshire', name: 'Clackmannanshire' },
  { slug: 'dumfries-and-galloway', name: 'Dumfries and Galloway' },
  { slug: 'dundee-city', name: 'Dundee City' },
  { slug: 'east-ayrshire', name: 'East Ayrshire' },
  { slug: 'east-dunbartonshire', name: 'East Dunbartonshire' },
  { slug: 'east-lothian', name: 'East Lothian' },
  { slug: 'east-renfrewshire', name: 'East Renfrewshire' },
  { slug: 'falkirk', name: 'Falkirk' },
  { slug: 'fife', name: 'Fife' },
  { slug: 'glasgow-city', name: 'Glasgow City' },
  { slug: 'highland', name: 'Highland' },
  { slug: 'inverclyde', name: 'Inverclyde' },
  { slug: 'midlothian', name: 'Midlothian' },
  { slug: 'moray', name: 'Moray' },
  { slug: 'na-h-eileanan-siar', name: 'Na h-Eileanan Siar (Western Isles)' },
  { slug: 'north-ayrshire', name: 'North Ayrshire' },
  { slug: 'north-lanarkshire', name: 'North Lanarkshire' },
  { slug: 'orkney-islands', name: 'Orkney Islands' },
  { slug: 'perth-and-kinross', name: 'Perth and Kinross' },
  { slug: 'renfrewshire', name: 'Renfrewshire' },
  { slug: 'scottish-borders', name: 'Scottish Borders' },
  { slug: 'shetland-islands', name: 'Shetland Islands' },
  { slug: 'south-ayrshire', name: 'South Ayrshire' },
  { slug: 'south-lanarkshire', name: 'South Lanarkshire' },
  { slug: 'stirling', name: 'Stirling' },
  { slug: 'west-dunbartonshire', name: 'West Dunbartonshire' },
  { slug: 'west-lothian', name: 'West Lothian' },
] as const;
