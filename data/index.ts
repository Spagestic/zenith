// lib/seedData.ts

export const SEED_ARTICLES = [
  {
    title:
      "Germany's Merz Meets China's Tech Vanguard, Including Alibaba and Unitree CEOs",
    slug: "germanys-merz-meets-chinas-tech-vanguard",
    kidSummary:
      "Germany's leader visited China to meet the people behind some of the world's coolest robots and apps! He watched robots dance and even tried on special AI glasses.",
    originalText: `German Chancellor Friedrich Merz visited China’s eastern tech hub of Hangzhou on Thursday and met leading figures including those from Alibaba Group Holding and Unitree Robotics, signalling growing international recognition of the country’s robotics and artificial intelligence technologies.

Merz had lunch and took group photos with local entrepreneurs, including Alibaba CEO Eddie Wu Yongming and Unitree founder and CEO Wang Xingxing. He met representatives from 10 companies in Hangzhou that specialise in AI, humanoid robots and electric vehicles (EVs).

A highlight of the visit was Merz’s tour of Unitree, a leader in humanoid robots. Unitree’s Wang showcased humanoids dancing, boxing and performing martial arts. Merz also tried on Rokid’s AI glasses and expressed “strong interest and appreciation for the product”.`,
    imageUrl: "/data/germanys-merz-meets-chinas-tech-vanguard.png",
    category: "world" as const,
    sourceUrl:
      "https://www.scmp.com/tech/article/3344835/germanys-merz-meets-chinas-tech-vanguard-including-alibaba-and-unitree-ceos",
    sourceName: "SCMP",
    publishedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    readingTimeMinutes: 2,
  },
  {
    title:
      "Hong Kong's Skaters See a Bright Future After Milano-Cortina but Obstacles Still Remain",
    slug: "hong-kongs-skaters-bright-future-milano-cortina",
    kidSummary:
      "Hong Kong's ice skaters did amazing at the Winter Olympics! But training is hard because the city has no Olympic-sized rink.",
    originalText: `Hong Kong’s skating community is riding a new wave of confidence after Joey Lam Ching-yan’s historic seventh-place finish at Milano-Cortina 2026, the city’s best result at the Winter Olympics.

For the first time, Hong Kong had both male and female skaters at the same Winter Games, marking a milestone for a city better known for subtropical heat than frozen rinks.

Despite the progress, Hong Kong’s skaters train in a landscape defined by scarcity. With no Olympic-size rink and limited access to ice, athletes say local conditions make global competitiveness an uphill battle. “We always struggle to adapt when competing overseas because the rinks are much larger than what we train on,” said figure skater Jarvis Ho.`,
    imageUrl: "/herosection/sports.png",
    category: "sports" as const, // Changed to "sports" to fit schema
    sourceUrl:
      "https://www.scmp.com/sport/hong-kong/article/3344953/hong-kongs-skaters-see-bright-future-after-milano-cortina",
    sourceName: "SCMP",
    publishedAt: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
    readingTimeMinutes: 4,
  },
  {
    title:
      "Hong Kong Developer Sino Land Posts Steady Profit, Points to Clear Market Improvements",
    slug: "hong-kong-developer-sino-land-steady-profit",
    kidSummary:
      "A big Hong Kong property company made a lot of money and says the city's housing market is getting better.",
    originalText: `Major Hong Kong developer Sino Land posted a steady net profit for the six months ended December, propped up by early gains from a recovery in the city’s residential property market.

Sino Land reported a net profit of HK$2.22 billion (US$284 million) in the first half of its current financial year. The company’s revenue rose 34.5 per cent to HK$5.19 billion from HK$3.85 billion a year ago. Revenue from property sales jumped 2.8 times to HK$6.91 billion.

“I am encouraged by the clear improvement in both the economic and operating environment,” chairman Daryl Ng Win Kong said, citing the interest-rate-cut cycle, Hong Kong’s talent admission scheme and mainland China’s national economic blueprint for bolstering the property sector.`,
    imageUrl: "/herosection/business.png",
    category: "hong_kong" as const, // Mapped "Business" to "hong_kong"
    sourceUrl:
      "https://www.scmp.com/business/companies/article/3344915/hong-kong-developer-sino-land-posts-steady-profit",
    sourceName: "SCMP",
    publishedAt: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
    readingTimeMinutes: 2,
  },
  {
    title:
      "NASA Overhauls Artemis Mission Amid Setbacks in Moon Race with China",
    slug: "nasa-overhauls-artemis-mission-moon-race",
    kidSummary:
      "NASA changed its plans to land on the moon. Instead of going straight there, astronauts will first practice closer to Earth — all while racing against China to get there first!",
    originalText: `Nasa is shaking up its Artemis mission to the moon, cancelling a multibillion-dollar Boeing upgrade to the centrepiece SLS rocket and slotting in a test flight closer to Earth as the programme remains beset by delays and cost overruns.

The changes announced on Friday mean that Nasa is essentially swapping the actual moon landing for an additional test mission staged closer to Earth – while insisting the 2028 deadline for a lunar touchdown remains unchanged.

Nasa said the goal of the changed sequence is to fly more frequently to counteract one of the biggest criticisms of Artemis: the slow development pace of its SLS rocket. The agency has tasked Elon Musk’s SpaceX and Jeff Bezos’ Blue Origin to build landers to ferry humans to and from the moon.`,
    imageUrl: "/herosection/nasa.png",
    category: "science" as const,
    sourceUrl:
      "https://www.scmp.com/news/world/united-states-canada/article/3344936/nasa-overhauls-artemis-mission-amid-setbacks-moon-race-china",
    sourceName: "SCMP",
    publishedAt: Date.now() - 8 * 60 * 60 * 1000, // 8 hours ago
    readingTimeMinutes: 3,
  },
  {
    title:
      "India's AI Superpower Dream Lands US$200 Billion – Now Comes the Hard Part",
    slug: "indias-ai-superpower-dream-lands-200-billion",
    kidSummary:
      "India wants to become one of the top three AI countries in the world. Huge companies are investing billions of dollars — but can India train enough people fast enough?",
    originalText: `Delhi is seeking to leverage its experience in building large-scale digital public infrastructure and its vast pool of tech talent as the foundation for this transformation.

That sales pitch certainly appears to be drawing attention. The five-day AI summit, which ran to February 20, produced a wave of investment pledges. India’s minister for electronics and IT, Ashwini Vaishnaw, announced more than US$200 billion in AI and deep-tech commitments over the next two years.

Reliance Group pledged US$110 billion into data centres and related infrastructure, while domestic rival Adani Group said it would invest US$100 billion in renewable energy-powered AI data centres by 2035. Microsoft said it planned to invest US$50 billion by the end of the decade.`,
    imageUrl: "/herosection/robot.png",
    category: "tech" as const,
    sourceUrl:
      "https://www.scmp.com/week-asia/economics/article/3344919/indias-ai-superpower-dream-lands-us200-billion",
    sourceName: "SCMP",
    publishedAt: Date.now() - 10 * 60 * 60 * 1000, // 10 hours ago
    readingTimeMinutes: 4,
  },
];

// NOTE: When inserting these into Convex via a seed script, capture the returned
// `articleId`s and inject them into this quizzes array.
export const SEED_QUIZZES = [
  {
    // articleId: will go here
    question:
      "What cool technology did the leader of Germany get to see when he visited China?",
    options: [
      "Dancing robots and AI glasses",
      "A new type of airplane",
      "A giant space rocket",
      "A new video game console",
    ],
    correctIndex: 0,
    order: 1,
  },
  {
    // articleId: will go here
    question:
      "What is the biggest problem for ice skaters training in Hong Kong right now?",
    options: [
      "It is too cold outside",
      "There are no Olympic-sized ice rinks",
      "They don't have ice skates",
      "The ice is too slippery",
    ],
    correctIndex: 1,
    order: 1,
  },
  {
    // articleId: will go here
    question: "What did NASA decide to change about their mission to the moon?",
    options: [
      "They are never going back",
      "They will practice closer to Earth first",
      "They are going to Mars instead",
      "They are sending a robot dog",
    ],
    correctIndex: 1,
    order: 1,
  },
];
