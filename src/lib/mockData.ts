import { User, GolfScore, Charity, Draw, Winner, DirectDonation, PlatformAnalytics } from '@/types';

export const INITIAL_CHARITIES: Charity[] = [
  {
    id: 'charity-1',
    name: 'Fairway for Kids',
    tagline: 'Transforming young lives through sport, mentorship, and education.',
    category: 'Youth & Children',
    description:
      'Fairway for Kids provides sports access, academic tutoring, and emotional mentorship to underprivileged children from high-density urban areas. We believe every child deserves the confidence, discipline, and opportunities that guided athletics provide.',
    impactStory:
      'Over 2,400 children have completed our year-round mentorship program, achieving a 98% high-school graduation rate and gaining collegiate scholarship pathways.',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    websiteUrl: 'https://example.org/fairway-kids',
    isSpotlight: true,
    totalRaised: 52400,
    supporterCount: 438,
    upcomingEvents: [
      {
        id: 'evt-1',
        title: 'Junior Hope Invitational & Pro Charity Day',
        date: '2026-04-18',
        location: 'Royal Pines Championship Course',
        description: '18-hole scramble tournament pairing amateur golfers with junior athletes, followed by an evening charity auction dinner.',
        ticketPrice: 150,
        spotsLeft: 14,
      },
      {
        id: 'evt-2',
        title: 'Youth Golf Academy Summer Kickoff',
        date: '2026-05-30',
        location: 'Melbourne Sports Park',
        description: 'Hands-on clinic and equipment donation drive for 120 local youth.',
        ticketPrice: 25,
        spotsLeft: 40,
      }
    ],
  },
  {
    id: 'charity-2',
    name: 'Valor & Heroes Foundation',
    tagline: 'Restoring dignity, healing, and adaptive sports to military veterans.',
    category: 'Veterans & Heroes',
    description:
      'Valor & Heroes supports wounded combat veterans, emergency medical first responders, and their families. Through adaptive sports, PTSD therapy retreats, and community service days, we help heroes find purpose after service.',
    impactStory:
      'Funded over 600 specialized physical therapy sessions and provided 85 adaptive golf wheelchairs and sporting prosthetics for disabled service members.',
    imageUrl: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?auto=format&fit=crop&w=1200&q=80',
    websiteUrl: 'https://example.org/valor-heroes',
    isSpotlight: true,
    totalRaised: 68900,
    supporterCount: 612,
    upcomingEvents: [
      {
        id: 'evt-3',
        title: 'Valor Scramble & Military Tribute Gala',
        date: '2026-05-12',
        location: 'The National Golf Club',
        description: 'Honoring fallen heroes with an annual medal-play charity tournament and keynote dinner with decorated veterans.',
        ticketPrice: 220,
        spotsLeft: 8,
      }
    ],
  },
  {
    id: 'charity-3',
    name: 'Green Horizon Corridor',
    tagline: 'Reforesting native habitats and safeguarding fragile ecosystems.',
    category: 'Environment',
    description:
      'Green Horizon coordinates native tree-planting initiatives, water filtration wetland sanctuaries, and ecological regeneration projects along degraded coastal landscapes.',
    impactStory:
      'Over 180,000 native trees planted and 450 hectares of critical wildlife corridor restored across three state regions.',
    imageUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
    websiteUrl: 'https://example.org/green-horizon',
    isSpotlight: true,
    totalRaised: 41250,
    supporterCount: 345,
    upcomingEvents: [
      {
        id: 'evt-4',
        title: 'EcoLinks Open: Plant a Tree per Birdie',
        date: '2026-06-05',
        location: 'Kingston Dunes Reserve',
        description: 'Every registered golfer plants 10 native trees automatically, with bonus matching from corporate sponsors for each birdie scored.',
        ticketPrice: 120,
        spotsLeft: 26,
      }
    ],
  },
  {
    id: 'charity-4',
    name: 'Oncology Hope Initiative',
    tagline: 'Pioneering pediatric clinical trials and compassionate patient housing.',
    category: 'Health & Medical',
    description:
      'Accelerating pediatric cancer research, targeted immunological therapies, and providing comfortable, fully subsidized family lodgings near tertiary treatment centers.',
    impactStory:
      'Supported 340 families with zero-cost housing during intensive treatments and contributed funding to 4 clinical breakthrough trials.',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    websiteUrl: 'https://example.org/oncology-hope',
    isSpotlight: false,
    totalRaised: 81300,
    supporterCount: 780,
    upcomingEvents: [
      {
        id: 'evt-5',
        title: 'Swing for a Cure Pro-Am Tournament',
        date: '2026-05-29',
        location: 'St. Andrews Old Course Links',
        description: 'Elite pro-am invitational bringing together golf champions and generous patrons for children oncology research.',
        ticketPrice: 350,
        spotsLeft: 4,
      }
    ],
  },
  {
    id: 'charity-5',
    name: 'Community Table Project',
    tagline: 'Rescuing surplus food to nourish families facing extreme hardship.',
    category: 'Community Impact',
    description:
      'Collecting farm-fresh surplus produce and culinary staples from partner growers and delivering chef-prepared, balanced family hampers to communities experiencing severe cost-of-living distress.',
    impactStory:
      'Distributed over 520,000 freshly cooked meals and diverted 320 tons of organic produce from regional landfill.',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    websiteUrl: 'https://example.org/community-table',
    isSpotlight: false,
    totalRaised: 33700,
    supporterCount: 290,
    upcomingEvents: [
      {
        id: 'evt-6',
        title: 'Harvest Charity Challenge',
        date: '2026-07-14',
        location: 'Yarra Valley Country Club',
        description: 'A 9-hole twilight competition paired with a regional wine and artisanal produce dinner in support of food relief.',
        ticketPrice: 95,
        spotsLeft: 30,
      }
    ],
  },
];

export const INITIAL_USERS: User[] = [];

// Rolling 5 golf scores per user (Stableford format 1-45, reverse chronological)
export const INITIAL_GOLF_SCORES: GolfScore[] = [];

export const INITIAL_DRAWS: Draw[] = [
  {
    id: 'draw-current-championship',
    name: 'Official Monthly Championship Draw',
    drawDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    monthYear: '2026-09',
    status: 'scheduled',
    drawLogic: 'algorithmic',
    winningNumbers: [],
    totalPrizePool: 50000,
    jackpotPool: 40700,
    tier4Pool: 16975,
    tier3Pool: 12125,
    rolloverFromPrevious: 21300,
    rolloverToNext: 0,
    totalSubscribersEntered: 2380,
  },
  {
    id: 'draw-prev-championship',
    name: 'August Championship Draw',
    drawDate: new Date(Date.now() - 25 * 86400000).toISOString(),
    monthYear: '2026-08',
    status: 'published',
    drawLogic: 'algorithmic',
    winningNumbers: [7, 14, 21, 35, 42],
    totalPrizePool: 50000,
    jackpotPool: 40700,
    tier4Pool: 16975,
    tier3Pool: 12125,
    rolloverFromPrevious: 19400,
    rolloverToNext: 40700,
    totalSubscribersEntered: 2310,
    publishedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
];

export const INITIAL_WINNERS: Winner[] = [];

export const INITIAL_DONATIONS: DirectDonation[] = [
  {
    id: 'don-1',
    userId: 'user-1',
    donorName: 'Sarah Jenkins',
    donorEmail: 'sarah@digitalheroes.test',
    charityId: 'charity-1',
    charityName: 'Fairway for Kids',
    amount: 150,
    isIndependent: true,
    message: 'Keep providing the wonderful junior coaching clinics!',
    createdAt: '2026-03-12T11:20:00Z',
  },
  {
    id: 'don-2',
    donorName: 'Arthur Pendelton',
    donorEmail: 'arthur.p@example.com',
    charityId: 'charity-2',
    charityName: 'Valor & Heroes Foundation',
    amount: 500,
    isIndependent: true,
    message: 'In honour of our veterans.',
    createdAt: '2026-03-17T09:15:00Z',
  }
];

export const INITIAL_ANALYTICS: PlatformAnalytics = {
  totalUsers: 2425,
  activeSubscribers: 2380,
  totalPrizePool: 80500,
  activeJackpot: 40700,
  totalCharityContributions: 124800,
  totalDrawsCompleted: 14,
  totalWinnersPaid: 42,
};
