export const SITE_NAME = "Belt of Truth Mentorship";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/resources", label: "Resources" },
  { href: "/blog", label: "Stories" },
  { href: "/contact", label: "Contact" },
] as const;

export const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1KbWTjdToQ/",
    icon: "facebook",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/njuguna_dave?igsh=MWtsemRnY2xyZHF3NQ==",
    icon: "instagram",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/254",
    icon: "whatsapp",
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@njugunambugua2624?si=8WQRm0kINsBGiNkr",
    icon: "youtube",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@njugunambugua?_r=1&_t=ZS-95ubAGsxuJJ",
    icon: "tiktok",
  },
] as const;

export const IMPACT_STATS = [
  { number: "50+", label: "High Schools & Colleges Visited" },
  { number: "2,000+", label: "Students Impacted" },
  { number: "20+", label: "Transformation Testimonies" },
] as const;

export const FOCUS_AREAS = [
  { emoji: "🧠", title: "Mental Health" },
  { emoji: "🚫", title: "Substance Abuse" },
  { emoji: "❤️", title: "Sexual Purity" },
  { emoji: "📱", title: "Social Media Discipline" },
] as const;

export const CORE_VALUES = [
  {
    title: "Truth",
    description:
      "We believe in the transforming power of God's truth to bring freedom, guiding young people to live according to His Word in every aspect of life.",
  },
  {
    title: "Purpose & Calling",
    description:
      "We affirm that every young person is created with divine purpose, and we help them discover and walk confidently in their calling.",
  },
  {
    title: "Purity & Righteous Living",
    description:
      "We uphold a lifestyle of purity, self-control, and righteousness, honoring God in thoughts, words, and actions.",
  },
  {
    title: "Accountability & Discipleship",
    description:
      "We foster mentorship and accountability where young people uplift one another in faith.",
  },
  {
    title: "Love & Compassion",
    description:
      "We create safe, supportive, and non-judgmental spaces where every young person is valued and heard.",
  },
  {
    title: "Transformation & Renewal",
    description:
      "We believe in the renewing power of the Holy Spirit to transform lives for lasting growth and impact.",
  },
] as const;

export const PROGRAMS = [
  {
    emoji: "🎓",
    title: "School & Campus Missions",
    description:
      "Outreach in schools and universities through mentorship talks and interactive forums that guide students toward intentional, truth-driven choices.",
  },
  {
    emoji: "⛪",
    title: "Church Youth Mentorship",
    description:
      "Partnering with churches to build spiritually grounded youth through discipleship, mentorship, and accountability.",
  },
  {
    emoji: "🏘️",
    title: "Community Outreach",
    description:
      "Safe spaces for youth engagement through discussions, mentorship forums, and life-skills training in local communities.",
  },
  {
    emoji: "🔁",
    title: "Habit Transformation",
    description:
      "Structured programs that help young people break destructive habits and build lasting discipline and consistency rooted in biblical principles.",
  },
  {
    emoji: "🧠",
    title: "Awareness & Empowerment",
    description:
      "Combining biblical guidance with practical strategies for real-life challenges: sexual purity, substance abuse, mental health, and social media pressure.",
  },
  {
    emoji: "🤝",
    title: "One-on-One Mentorship",
    description:
      "Personal mentorship and accountability to help individuals stay committed to growth and purpose on their unique journey.",
  },
] as const;

export const FREE_RESOURCES = [
  {
    emoji: "📖",
    title: "Bible Study Guides",
    description:
      "Structured guides to help young people dig deeper into God's Word and apply biblical truth to everyday life.",
  },
  {
    emoji: "🎧",
    title: "Podcast & Talks",
    description:
      "Audio messages covering topics like identity, purity, mental health, and purpose.",
  },
  {
    emoji: "📝",
    title: "Habit Journals",
    description:
      "Downloadable journals to track growth, set goals, and stay accountable.",
  },
] as const;

export const FOUNDER = {
  name: "M.D Njuguna",
  photo: "/images/founder.jpeg",
  bio: [
    "Mr. David Njuguna, widely known as M.D. Njuguna, is a devoted born-again Christian, a loving husband to Ann, and a proud father of two, Uebert and Karen. He is the visionary founder of Belt of Truth Mentorship, a purpose-driven initiative dedicated to raising a generation grounded in truth and righteousness.",
    "With a deep passion for youth mentorship, Mr. Njuguna actively serves as a Youth Patron in his local church, walking closely with young people as a guide, mentor, and spiritual father. His journey in youth ministry began in 2018 when he joined high school missions under a movement of young believers known as Ambassadors for Christ.",
    "Through this platform, he has ministered to and engaged with students across more than 50 high schools and colleges. Over the years, he developed a growing burden for the moral and spiritual struggles affecting young people. In 2023, Mr. Njuguna received a divine revelation guided by Ephesians 6:14, inspiring him to establish Belt of Truth Mentorship.",
  ],
} as const;

export const CONTACT_INTERESTS = [
  "Joining a mentorship program",
  "Volunteering as a mentor",
  "Church/school partnership",
  "General inquiry",
] as const;

export const DONATION_PRESETS_KES = [500, 1000, 2500, 5000] as const;
