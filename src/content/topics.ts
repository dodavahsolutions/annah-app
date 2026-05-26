import type { LucideIcon } from "lucide-react"
import { ClipboardCheck, Coins, Landmark, MapPin } from "lucide-react"

export interface TopicItem {
  id: string
  label: string
  prompt: string
}

export interface TopicSection {
  title: string
  icon: LucideIcon
  items: TopicItem[]
}

// Prompt-shortcut nav ported from the main ANNAH chat. Each item dispatches a
// pre-written question to the assistant.
export const TOPIC_SECTIONS: TopicSection[] = [
  {
    title: "Scottish Schemes",
    icon: Landmark,
    items: [
      {
        id: "htb",
        label: "Help to Buy Scotland",
        prompt:
          "Explain Help to Buy Scotland — who qualifies, how much equity loan, and how to apply.",
      },
      {
        id: "lift",
        label: "LIFT / Shared Equity",
        prompt:
          "How does the LIFT Shared Equity scheme work in Scotland? Explain OMSE and NSSE.",
      },
      {
        id: "lbtt",
        label: "LBTT Relief",
        prompt:
          "What LBTT first-time buyer relief is available in Scotland? Show me the bands.",
      },
      {
        id: "first-home",
        label: "First Home Fund",
        prompt:
          "What was the First Home Fund in Scotland and what has replaced it?",
      },
    ],
  },
  {
    title: "Finance",
    icon: Coins,
    items: [
      {
        id: "deposit",
        label: "Deposit Requirements",
        prompt:
          "How much deposit do I need to buy a home in Scotland as a first-time buyer?",
      },
      {
        id: "mip",
        label: "Mortgage in Principle",
        prompt:
          "What is a mortgage in principle and do I need one before making an offer in Scotland?",
      },
      {
        id: "rates",
        label: "Fixed vs Tracker",
        prompt: "Should I choose a fixed or tracker rate mortgage in Scotland?",
      },
      {
        id: "dev-incentives",
        label: "Developer Incentives",
        prompt: "What developer incentives are common on Scottish new builds?",
      },
    ],
  },
  {
    title: "Buying Process",
    icon: ClipboardCheck,
    items: [
      {
        id: "conveyancing",
        label: "Scottish Conveyancing",
        prompt:
          "Walk me through the Scottish property buying process step by step — missives, Home Report, closing dates.",
      },
      {
        id: "offers",
        label: "Making an Offer",
        prompt:
          "How does making an offer work in Scotland? What are offers over, fixed price, and closing dates?",
      },
      {
        id: "snagging",
        label: "Snagging Surveys",
        prompt:
          "What is a snagging survey and when should I commission one on a Scottish new build?",
      },
      {
        id: "solicitor",
        label: "Finding a Solicitor",
        prompt: "How do I find a solicitor to buy a property in Scotland?",
      },
    ],
  },
  {
    title: "Areas",
    icon: MapPin,
    items: [
      {
        id: "edinburgh",
        label: "Edinburgh & Lothians",
        prompt:
          "What are the best new build areas in Edinburgh and the Lothians for first-time buyers? Include prices.",
      },
      {
        id: "glasgow",
        label: "Glasgow & West",
        prompt:
          "What new build developments are available in Glasgow and the West of Scotland?",
      },
      {
        id: "aberdeen",
        label: "Aberdeen & North",
        prompt:
          "What new build homes are available in Aberdeen and the north of Scotland?",
      },
      {
        id: "dundee",
        label: "Dundee & Tayside",
        prompt:
          "What new build developments are available in Dundee and Tayside?",
      },
      {
        id: "highlands",
        label: "Highlands & Islands",
        prompt:
          "What new build homes and rural schemes are available in the Scottish Highlands and Islands?",
      },
      {
        id: "stirling",
        label: "Stirling & Falkirk",
        prompt:
          "What new build developments are available in Stirling and Falkirk?",
      },
    ],
  },
]
