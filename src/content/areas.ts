// The 32 Scottish council areas. Shared by the lead-capture area picker
// (Sprint A, reads slug + name) and the area-guide pages (Sprint B, uses the
// richer content fields). `slug` and `name` are stable identity fields.

export interface CouncilArea {
  /** URL-safe identifier, e.g. 'city-of-edinburgh'. */
  slug: string;
  /** Official council area name. */
  name: string;
  /** Broad region used for grouping on the areas index. */
  region: string;
  /** A few of the larger towns/areas, for local colour. */
  towns: readonly string[];
  /** One-sentence positioning of the area (distinct per area). */
  intro: string;
  /** One-sentence buying/market context (distinct per area). */
  marketNote: string;
}

export const COUNCIL_AREAS: readonly CouncilArea[] = [
  {
    slug: 'aberdeen-city',
    name: 'Aberdeen City',
    region: 'North East',
    towns: ['Aberdeen', 'Dyce', 'Cults'],
    intro: 'Scotland\'s granite city and the heart of the north-east energy sector.',
    marketNote:
      'Prices here move with the energy economy, and the established granite tenements and suburbs offer a wide spread of values for buyers.',
  },
  {
    slug: 'aberdeenshire',
    name: 'Aberdeenshire',
    region: 'North East',
    towns: ['Inverurie', 'Peterhead', 'Stonehaven'],
    intro: 'A large rural county wrapping around Aberdeen, from coastal towns to farmland.',
    marketNote:
      'Commuter towns near the city sit alongside more affordable rural and coastal properties, so deposit and travel both shape the decision.',
  },
  {
    slug: 'angus',
    name: 'Angus',
    region: 'East',
    towns: ['Arbroath', 'Forfar', 'Montrose'],
    intro: 'A coastal and agricultural county between Dundee and Aberdeenshire.',
    marketNote:
      'Market towns and seaside spots tend to be more affordable than the nearby cities, appealing to value-focused buyers and commuters to Dundee.',
  },
  {
    slug: 'argyll-and-bute',
    name: 'Argyll and Bute',
    region: 'West Highlands & Islands',
    towns: ['Helensburgh', 'Oban', 'Dunoon'],
    intro: 'A sprawling west-coast region of sea lochs, peninsulas and inhabited islands.',
    marketNote:
      'Geography matters here — island and remote-rural homes can be harder to value and survey, so factor extra time into the buying process.',
  },
  {
    slug: 'city-of-edinburgh',
    name: 'City of Edinburgh',
    region: 'East',
    towns: ['Edinburgh', 'Leith', 'Corstorphine'],
    intro: 'Scotland\'s capital and its most competitive housing market.',
    marketNote:
      'Popular homes routinely sell for well above the Home Report valuation under "offers over", so budget for the gap between valuation and final price.',
  },
  {
    slug: 'clackmannanshire',
    name: 'Clackmannanshire',
    region: 'Central',
    towns: ['Alloa', 'Tillicoultry', 'Alva'],
    intro: 'Scotland\'s smallest mainland county, tucked beneath the Ochil Hills.',
    marketNote:
      'Relatively affordable values and central-belt access make it attractive to first-time buyers commuting to Stirling and beyond.',
  },
  {
    slug: 'dumfries-and-galloway',
    name: 'Dumfries and Galloway',
    region: 'South West',
    towns: ['Dumfries', 'Stranraer', 'Castle Douglas'],
    intro: 'A largely rural south-west region of rolling hills and a long coastline.',
    marketNote:
      'Among the more affordable parts of Scotland, with characterful rural and small-town homes — though rural surveys can take longer.',
  },
  {
    slug: 'dundee-city',
    name: 'Dundee City',
    region: 'East',
    towns: ['Dundee', 'Broughty Ferry', 'Lochee'],
    intro: 'A compact waterfront city transformed by major regeneration.',
    marketNote:
      'A mix of student-driven demand and waterfront renewal gives buyers options from value flats to sought-after Broughty Ferry homes.',
  },
  {
    slug: 'east-ayrshire',
    name: 'East Ayrshire',
    region: 'South West',
    towns: ['Kilmarnock', 'Cumnock', 'Stewarton'],
    intro: 'An inland Ayrshire county centred on the town of Kilmarnock.',
    marketNote:
      'Lower average prices and rail links toward Glasgow make it a budget-friendly option for first-time buyers and commuters.',
  },
  {
    slug: 'east-dunbartonshire',
    name: 'East Dunbartonshire',
    region: 'Greater Glasgow',
    towns: ['Bearsden', 'Bishopbriggs', 'Kirkintilloch'],
    intro: 'Affluent commuter suburbs on the northern edge of Glasgow.',
    marketNote:
      'Strong schools and leafy suburbs keep demand — and prices — high, so larger deposits are common in the most sought-after streets.',
  },
  {
    slug: 'east-lothian',
    name: 'East Lothian',
    region: 'East',
    towns: ['Musselburgh', 'Haddington', 'North Berwick'],
    intro: 'A coastal county of golf links and commuter towns east of Edinburgh.',
    marketNote:
      'Demand spills over from Edinburgh, and seaside towns like North Berwick command a premium for their lifestyle appeal.',
  },
  {
    slug: 'east-renfrewshire',
    name: 'East Renfrewshire',
    region: 'Greater Glasgow',
    towns: ['Newton Mearns', 'Giffnock', 'Barrhead'],
    intro: 'A prosperous suburban county on Glasgow\'s southern fringe.',
    marketNote:
      'Highly rated schools drive competition for family homes, often pushing agreed prices above the Home Report valuation.',
  },
  {
    slug: 'falkirk',
    name: 'Falkirk',
    region: 'Central',
    towns: ['Falkirk', 'Grangemouth', 'Bo’ness'],
    intro: 'A central-belt district midway between Edinburgh and Glasgow.',
    marketNote:
      'Excellent rail and motorway links to both cities make it a practical, relatively affordable commuter base.',
  },
  {
    slug: 'fife',
    name: 'Fife',
    region: 'East',
    towns: ['Dunfermline', 'Kirkcaldy', 'St Andrews'],
    intro: 'A varied peninsula kingdom from commuter towns to historic St Andrews.',
    marketNote:
      'Prices range widely — affordable in central Fife, but a premium in St Andrews and the picturesque East Neuk villages.',
  },
  {
    slug: 'glasgow-city',
    name: 'Glasgow City',
    region: 'Greater Glasgow',
    towns: ['Glasgow', 'Shawlands', 'Dennistoun'],
    intro: 'Scotland\'s largest city, with characterful tenements and diverse neighbourhoods.',
    marketNote:
      'Buyers can find everything from value first flats to sought-after West End and Southside homes where competition raises prices.',
  },
  {
    slug: 'highland',
    name: 'Highland',
    region: 'Highlands',
    towns: ['Inverness', 'Fort William', 'Aviemore'],
    intro: 'Scotland\'s largest council area, spanning Inverness to remote glens and coast.',
    marketNote:
      'Inverness anchors a steadier market, while remote-rural and croft properties can need specialist lending and longer surveys.',
  },
  {
    slug: 'inverclyde',
    name: 'Inverclyde',
    region: 'West',
    towns: ['Greenock', 'Port Glasgow', 'Gourock'],
    intro: 'A Clyde-coast district with views across the firth and rail links to Glasgow.',
    marketNote:
      'Generally affordable, with waterfront and elevated properties offering standout views toward the hills and river.',
  },
  {
    slug: 'midlothian',
    name: 'Midlothian',
    region: 'East',
    towns: ['Dalkeith', 'Penicuik', 'Bonnyrigg'],
    intro: 'A fast-growing commuter county directly south of Edinburgh.',
    marketNote:
      'New-build estates and the Borders Railway have fuelled demand, making it a key overflow market for Edinburgh buyers.',
  },
  {
    slug: 'moray',
    name: 'Moray',
    region: 'North East',
    towns: ['Elgin', 'Forres', 'Buckie'],
    intro: 'A north-east county of whisky country, farmland and a sheltered coast.',
    marketNote:
      'Comparatively affordable values and a relaxed pace appeal to buyers prioritising space over proximity to a city.',
  },
  {
    slug: 'na-h-eileanan-siar',
    name: 'Na h-Eileanan Siar (Western Isles)',
    region: 'Islands',
    towns: ['Stornoway', 'Tarbert', 'Lochmaddy'],
    intro: 'The Outer Hebrides — an island chain off Scotland\'s north-west coast.',
    marketNote:
      'Island purchases, including croft tenure, can involve specialist legal and lending considerations, so plan for a longer process.',
  },
  {
    slug: 'north-ayrshire',
    name: 'North Ayrshire',
    region: 'South West',
    towns: ['Irvine', 'Saltcoats', 'Largs'],
    intro: 'A Clyde-coast county that also takes in the Isle of Arran.',
    marketNote:
      'Affordable coastal towns sit alongside island living on Arran, where the market is smaller and more seasonal.',
  },
  {
    slug: 'north-lanarkshire',
    name: 'North Lanarkshire',
    region: 'Central',
    towns: ['Motherwell', 'Coatbridge', 'Cumbernauld'],
    intro: 'A populous central-belt county east of Glasgow.',
    marketNote:
      'Strong transport links and a good supply of affordable homes make it popular with first-time buyers and commuters.',
  },
  {
    slug: 'orkney-islands',
    name: 'Orkney Islands',
    region: 'Islands',
    towns: ['Kirkwall', 'Stromness', 'St Margaret’s Hope'],
    intro: 'A northern archipelago with a distinctive heritage and tight-knit communities.',
    marketNote:
      'A small, steady island market where availability is limited and surveys and conveyancing can take longer than on the mainland.',
  },
  {
    slug: 'perth-and-kinross',
    name: 'Perth and Kinross',
    region: 'Central',
    towns: ['Perth', 'Crieff', 'Pitlochry'],
    intro: 'A central county bridging the lowlands and the southern Highlands.',
    marketNote:
      'Perth offers city convenience while scenic towns like Pitlochry carry a lifestyle premium for their Highland-edge setting.',
  },
  {
    slug: 'renfrewshire',
    name: 'Renfrewshire',
    region: 'Greater Glasgow',
    towns: ['Paisley', 'Renfrew', 'Johnstone'],
    intro: 'A district west of Glasgow, home to the airport and historic Paisley.',
    marketNote:
      'Good value and excellent connectivity — including the airport and rail — make it a practical choice for commuters.',
  },
  {
    slug: 'scottish-borders',
    name: 'Scottish Borders',
    region: 'South East',
    towns: ['Galashiels', 'Peebles', 'Melrose'],
    intro: 'A rural south-east region of mill towns, rivers and rolling hills.',
    marketNote:
      'The Borders Railway has boosted northern towns, while characterful rural homes appeal to those seeking space and scenery.',
  },
  {
    slug: 'shetland-islands',
    name: 'Shetland Islands',
    region: 'Islands',
    towns: ['Lerwick', 'Scalloway', 'Brae'],
    intro: 'Scotland\'s northernmost islands, with strong energy and fishing economies.',
    marketNote:
      'A small island market where the energy sector supports demand, but limited stock and remote surveys shape timelines.',
  },
  {
    slug: 'south-ayrshire',
    name: 'South Ayrshire',
    region: 'South West',
    towns: ['Ayr', 'Prestwick', 'Troon'],
    intro: 'A south-west coastal county famed for its golf courses and beaches.',
    marketNote:
      'Coastal and golf-town homes in Troon and Prestwick attract a premium, while inland values stay more accessible.',
  },
  {
    slug: 'south-lanarkshire',
    name: 'South Lanarkshire',
    region: 'Central',
    towns: ['Hamilton', 'East Kilbride', 'Lanark'],
    intro: 'A large central county from suburban new towns to rural Clydesdale.',
    marketNote:
      'East Kilbride and Hamilton offer plentiful family housing and commuter links, with more rural value further south.',
  },
  {
    slug: 'stirling',
    name: 'Stirling',
    region: 'Central',
    towns: ['Stirling', 'Bridge of Allan', 'Dunblane'],
    intro: 'A historic city and gateway between the central belt and the Highlands.',
    marketNote:
      'Desirable towns like Bridge of Allan and Dunblane command a premium, balanced by more affordable city and rural options.',
  },
  {
    slug: 'west-dunbartonshire',
    name: 'West Dunbartonshire',
    region: 'West',
    towns: ['Dumbarton', 'Clydebank', 'Alexandria'],
    intro: 'A western district stretching from the Clyde to the shores of Loch Lomond.',
    marketNote:
      'Affordable urban homes near Glasgow sit close to the loch, appealing to buyers who want value and nearby scenery.',
  },
  {
    slug: 'west-lothian',
    name: 'West Lothian',
    region: 'Central',
    towns: ['Livingston', 'Bathgate', 'Linlithgow'],
    intro: 'A central county positioned between Edinburgh and Glasgow.',
    marketNote:
      'Livingston\'s new-build supply and historic Linlithgow\'s appeal give buyers a broad range across price points.',
  },
] as const;
