// Single source for business facts. Everything here comes from the KOTS
// company profile PDF; do not add claims that are not in it.
export const site = {
  name: 'KOTS Group Investments',
  shortName: 'KOTS',
  tagline: 'Air Conditioning • Commercial Refrigeration • Plumbing',
  description:
    'Zimbabwean technical services company providing air conditioning, commercial refrigeration and plumbing solutions to residential, commercial and property-development clients. Based in Harare, working nationwide.',
  domain: 'https://kotsgroup.com',
  email: 'kotsgroupinvestments@gmail.com',
  phones: [
    { display: '+263 786 051 703', tel: '+263786051703' },
    { display: '+263 784 053 829', tel: '+263784053829' },
  ],
  whatsapp: '263786051703',
  city: 'Harare',
  country: 'Zimbabwe',
};

export const nav = [
  { href: '/', label: 'Home' },
  { href: '/air-conditioning/', label: 'Air Conditioning' },
  { href: '/refrigeration/', label: 'Refrigeration' },
  { href: '/plumbing/', label: 'Plumbing' },
  { href: '/contact/', label: 'Contact' },
];

export function waLink(text?: string) {
  const base = `https://wa.me/${site.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
