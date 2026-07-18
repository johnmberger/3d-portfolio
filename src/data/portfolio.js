/** Resume content for the monitor screen — sourced from LinkedIn / johnmberger.com. */
import { RESUME_URL } from '../resumeUrl.js'

export const portfolio = {
  name: 'John Berger',
  role: 'Senior Software Engineer',
  location: 'Atlanta, GA',
  blurb:
    'Frontend-leaning full-stack engineer. I love philosophy (I majored in it!), technology, and design — I build intuitive websites, solid APIs, and tools people actually enjoy using.',
  email: 'hi@johnberger.dev',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/johnmberger/' },
    { label: 'GitHub', href: 'https://github.com/johnmberger' },
    { label: 'Resume', href: RESUME_URL },
  ],
  skills: [
    'TypeScript',
    'JavaScript',
    'Vue',
    'React',
    'Next.js',
    'Remix',
    'Node',
    'GraphQL',
    'PostgreSQL',
    'MongoDB',
    'AWS',
    'Figma',
  ],
  education: {
    school: 'Vanderbilt University',
    degree: 'B.S., Philosophy',
    detail: 'Nashville, TN',
  },
  experience: [
    {
      id: 'wbd',
      title: 'Senior Software Engineer',
      company: 'Warner Bros. Discovery',
      dates: 'Jan 2024 — Present',
      location: 'Atlanta, GA',
      tag: 'Current',
      summary:
        'Full-stack work on the Media Management team — tooling for video and image pipelines and internal CMS systems.',
      highlights: [
        'Build and maintain media tooling used across WBD properties',
        'Ship full-stack features spanning front-end UX and backend services',
        'Prefer front-end and user-facing work while owning the stack end to end',
      ],
      stack: ['TypeScript', 'Vue / React', 'Node', 'Internal CMS'],
    },
    {
      id: 'groundfloor',
      title: 'Lead Frontend Engineer',
      company: 'Groundfloor Finance',
      dates: 'Jan 2023 — Jan 2024',
      location: 'Atlanta, GA',
      tag: 'Fintech',
      summary:
        'Led front-end development for the Groundfloor investing platform on a blended full-stack team.',
      highlights: [
        'Directed UX and design direction with Figma, guided by end-user feedback',
        'Drove a months-long refactor toward modern web standards, accessibility, and code quality',
        'Partnered closely with product and design on day-to-day shipping',
      ],
      stack: ['Vue', 'GraphQL', 'GitHub Actions', 'AWS', 'Figma'],
    },
    {
      id: 'dept',
      title: 'Principal Engineer',
      company: 'DEPT®',
      dates: 'Jan 2022 — Jan 2023',
      location: 'Atlanta, GA',
      tag: 'Agency',
      summary:
        'Built DEPT DASH™ — a full-stack meta framework for marketing and e-commerce sites.',
      highlights: [
        'Shipped a reusable framework across React, Next.js, and Remix',
        'Integrated commerce and content platforms for client builds',
        'Worked in Storybook and Figma to keep design systems coherent',
      ],
      stack: [
        'React',
        'Next.js',
        'Remix',
        'Postgres',
        'Node',
        'Tailwind',
        'Shopify',
        'Contentful',
      ],
    },
    {
      id: 'cardlytics',
      title: 'Front End → Engineering Lead → Principal FE',
      company: 'Cardlytics',
      dates: 'Apr 2019 — Jun 2022',
      location: 'Atlanta, GA',
      tag: 'AdTech',
      summary:
        'Grew from front-end developer to Engineering Lead (team of seven) and Principal Front End Engineer on Cardlytics’ advertising products.',
      highlights: [
        'Led a seven-engineer team shipping Ads Manager and related products',
        'Owned design partnership and front-end architecture (Vue, Storybook, GraphQL)',
        'Built self-serve campaign tooling: create, manage, and report on ad campaigns',
      ],
      stack: ['TypeScript', 'Vue 3', 'Apollo / GraphQL', '.NET APIs', 'AWS'],
    },
  ],
  projects: [
    {
      id: 'ads-manager',
      title: 'Cardlytics Ads Manager',
      year: '2019–22',
      tag: 'Product',
      summary:
        'Self-service advertising platform — build, manage, and report on campaigns. TypeScript, Vue 3, custom component library, Apollo GraphQL, .NET APIs.',
      href: 'https://www.cardlytics.com/',
    },
    {
      id: 'asu-pitch',
      title: 'ASU Pitch',
      year: 'Earlier',
      tag: 'Platform',
      summary:
        'Communication platform for 70,000+ students and staff. Lead for web app, iOS, and microservice architecture — Node, Meteor, MongoDB, AWS, Lex NLP.',
      href: '#',
    },
    {
      id: 'sitekite',
      title: 'SiteKite',
      year: 'Side',
      tag: 'Tooling',
      summary:
        'Portfolio builder for developers — Node, Express, PostgreSQL, OAuth, Heroku.',
      href: '#',
    },
    {
      id: 'beer',
      title: "What's John Drinking?",
      year: 'Side',
      tag: 'Fun',
      summary:
        'Beer tracking via Untappd — AngularJS, Python scraper, Google Charts.',
      href: 'https://github.com/johnmberger/beer',
    },
  ],
}
