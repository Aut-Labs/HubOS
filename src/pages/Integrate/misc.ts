export const ContractTypes = [
  {
    label: 'Moloch DAO V1',
    value: 2,
  },
  {
    label: 'Moloch DAO V2',
    value: 3,
  },
  {
    label: 'Moloch DAO V3',
    value: 4,
  },
  {
    label: 'SkillWallet (Legacy)',
    value: 1,
  },
];

export const MarketTemplates = [
  {
    title: 'Open-Source & DeFi',
    market: 1,
  },
  {
    title: 'Art, Events & NFTs',
    market: 2,
  },
  {
    title: 'Local Projects & DAOs',
    market: 3,
  },
];

export const CommitmentMessages = (value: number) => {
  switch (+value) {
    case 1:
      return `I got 99 problems, and a community ain't one`;
    case 2:
      return 'Billie Jean is not my lover.';
    case 3:
      return `They think I'm hiding in the shadows. But I am the shadows.`;
    case 4:
      return 'Eight or higher, bro.';
    case 5:
      return `Yes, no, maybe, I don't know. Can you repeat the question?`;
    case 6:
      return 'Pivot!';
    case 7:
      return 'You Jump, I Jump, Jack.';
    case 8:
      return 'You have my sword. And you have my bow. And my ax';
    case 9:
      return 'I’m a Mandalorian.';
    case 10:
      return '“After all this time?" "Always...”';
    default:
      return ``;
  }
};
