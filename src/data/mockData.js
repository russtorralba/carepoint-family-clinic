export const initialData = {
  services: [
    {
      id: 1,
      title: "Everyday care",
      description:
        "For colds, coughs, minor injuries, and the health questions that can’t wait.",
    },
    {
      id: 2,
      title: "Wellness visits",
      description:
        "Thoughtful check-ins and preventive care to help you feel your best.",
    },
    {
      id: 3,
      title: "Family health",
      description:
        "Supportive care for people of all ages, from little ones to grandparents.",
    },
    {
      id: 4,
      title: "Women’s health",
      description:
        "Comfortable, confidential conversations around your changing health needs.",
    },
  ],
  team: [
    {
      id: 1,
      name: "Dr. Maya Rowan",
      role: "Family physician · Fictional profile",
      initials: "MR",
    },
    {
      id: 2,
      name: "Jordan Ellis, NP",
      role: "Nurse practitioner · Fictional profile",
      initials: "JE",
    },
    {
      id: 3,
      name: "Samira Cole",
      role: "Clinic coordinator · Fictional profile",
      initials: "SC",
    },
  ],
  hours: [
    { id: 1, day: "Monday – Friday", hours: "8:00 AM – 6:00 PM" },
    { id: 2, day: "Saturday", hours: "9:00 AM – 1:00 PM" },
    { id: 3, day: "Sunday", hours: "Closed" },
  ],
  announcements: [
    {
      id: 1,
      title: "Welcome to CarePoint",
      body: "Our demo clinic site is now open for exploration.",
      date: "September 2026",
    },
    {
      id: 2,
      title: "Same-day visit slots",
      body: "A limited number of fictional same-day times are displayed daily.",
      date: "September 2026",
    },
  ],
  contact: {
    phone: "(555) 014-8372",
    email: "hello@carepointdemo.example",
    address: "248 Willow Street",
    city: "Maplewood, CA 94016",
  },
  images: [
    {
      slot: "hero-artwork",
      name: "Hero artwork",
      description: "Abstract sunrise and arch illustration",
      path: null,
      url: null,
    },
    {
      slot: "hours-artwork",
      name: "Hours artwork",
      description: "Abstract care statement graphic",
      path: null,
      url: null,
    },
  ],
  faqs: [
    {
      q: "Do you accept walk-ins?",
      a: "This fictional clinic is designed to show availability for same-day visits. In a real setting, calling ahead is always helpful.",
    },
    {
      q: "What should I bring to my visit?",
      a: "For this demo, no personal information is collected. A real clinic would explain what to bring when you book.",
    },
    {
      q: "Can I contact the clinic online?",
      a: "Yes. The contact details shown are fictional demonstration details, and no messages are sent or stored.",
    },
    {
      q: "Is this a real medical clinic?",
      a: "No. CarePoint Family Clinic is a fictional portfolio demonstration and does not provide medical advice or care.",
    },
  ],
};
