// 105 fake design job listings across global cities, created in the last 10 days
const cities = [
  "New York", "London", "Toronto", "Sydney", "Berlin", "Dubai", "Singapore", "Los Angeles",
  "Paris", "Amsterdam", "Tokyo", "San Francisco", "Melbourne", "Stockholm", "Barcelona",
  "Austin", "Vancouver", "Seoul", "Cape Town", "Dublin", "Milan", "Lisbon", "Chicago",
  "Copenhagen", "Hong Kong",
];

const jobs: { title: string; description: string; budgetRange: [number, number] }[] = [
  { title: "Logo Design for Tech Startup", description: "Create a modern, minimal logo for a SaaS company. Must include icon + wordmark variations.", budgetRange: [500, 1500] },
  { title: "Social Media Creatives Pack", description: "Design 30 Instagram post templates for a fashion brand. Canva-editable preferred.", budgetRange: [800, 2000] },
  { title: "UI/UX Design for Mobile App", description: "Design complete UI for a food delivery app. 15-20 screens including onboarding, home, cart, profile.", budgetRange: [2500, 6000] },
  { title: "Brand Identity Package", description: "Full brand kit including logo, colors, typography, business cards, letterhead, and brand guidelines.", budgetRange: [1500, 4000] },
  { title: "Website Redesign - Portfolio", description: "Redesign a photographer's portfolio website. Clean, minimal aesthetic with gallery focus.", budgetRange: [1000, 2500] },
  { title: "Product Packaging Design", description: "Design packaging for organic skincare line. 5 products, eco-friendly aesthetic.", budgetRange: [1200, 3000] },
  { title: "AI-Generated Art for NFT Collection", description: "Create 50 unique AI-assisted digital artworks for an NFT collection. Cyberpunk theme.", budgetRange: [2000, 5000] },
  { title: "Pitch Deck Design", description: "Design a 15-slide investor pitch deck for a fintech startup. Data visualization heavy.", budgetRange: [800, 1800] },
  { title: "YouTube Thumbnail Templates", description: "Create 20 eye-catching thumbnail templates for a tech review channel.", budgetRange: [300, 800] },
  { title: "E-commerce Banner Design", description: "Design 10 hero banners and promotional graphics for an online clothing store.", budgetRange: [500, 1200] },
  { title: "Restaurant Menu Design", description: "Design a premium menu card for a fine dining restaurant. Print-ready files needed.", budgetRange: [400, 1000] },
  { title: "App Icon Design", description: "Create a distinctive app icon for a meditation app. Multiple size variants needed.", budgetRange: [300, 700] },
  { title: "Infographic Design Series", description: "Design 10 infographics about AI trends for LinkedIn content marketing.", budgetRange: [800, 1800] },
  { title: "Wedding Invitation Design", description: "Design a premium digital wedding invitation with RSVP functionality mockup.", budgetRange: [500, 1200] },
  { title: "Dashboard UI Design", description: "Design an analytics dashboard for a healthcare SaaS platform. Dark and light modes.", budgetRange: [2000, 4500] },
  { title: "Motion Graphics for Ad Campaign", description: "Create 3 short motion graphic videos (15-30s) for Instagram/Facebook ads.", budgetRange: [1500, 3500] },
  { title: "Figma Design System", description: "Build a comprehensive design system in Figma with 50+ reusable components.", budgetRange: [3000, 7000] },
  { title: "Book Cover Design", description: "Design cover for a self-help book on AI productivity. Front, back, and spine.", budgetRange: [500, 1200] },
  { title: "3D Product Mockups", description: "Create photorealistic 3D mockups for a new smartphone case line. 10 designs.", budgetRange: [1000, 2500] },
  { title: "Email Newsletter Templates", description: "Design 5 responsive email newsletter templates for a B2B company.", budgetRange: [600, 1400] },
  { title: "Corporate Brochure Design", description: "Design a 12-page corporate brochure for a real estate company.", budgetRange: [800, 1800] },
  { title: "AI Chatbot UI Design", description: "Design conversational UI for an AI customer support chatbot widget.", budgetRange: [1200, 2800] },
  { title: "Social Media Brand Kit", description: "Create Instagram, LinkedIn, and Twitter profile designs + story templates.", budgetRange: [600, 1500] },
  { title: "Landing Page Design", description: "Design a high-converting landing page for an online course platform.", budgetRange: [800, 2000] },
  { title: "Icon Set Design", description: "Create a custom icon set of 100 icons for a project management tool.", budgetRange: [1000, 2200] },
  { title: "Poster Design for Event", description: "Design promotional posters for a tech conference. Print + digital versions.", budgetRange: [400, 1000] },
  { title: "T-shirt Design Collection", description: "Design 20 unique t-shirt graphics for a streetwear brand.", budgetRange: [800, 1800] },
  { title: "Wireframing for SaaS Product", description: "Create detailed wireframes for a project management SaaS. 25+ screens.", budgetRange: [1500, 3500] },
  { title: "AI Image Generation Workflow", description: "Set up and manage AI image generation pipeline using Midjourney/DALL-E for marketing.", budgetRange: [1000, 2500] },
  { title: "Vehicle Wrap Design", description: "Design full vehicle wrap for a delivery fleet. 3 vehicle types.", budgetRange: [1200, 2800] },
  { title: "Annual Report Design", description: "Design a 40-page annual report for a corporate client. Data-heavy layout.", budgetRange: [2000, 4500] },
  { title: "Game UI Design", description: "Design UI elements for a casual mobile puzzle game. Playful aesthetic.", budgetRange: [1800, 4000] },
  { title: "Illustration Series", description: "Create 15 custom illustrations for a children's educational app.", budgetRange: [1500, 3500] },
  { title: "AR Filter Design", description: "Design 5 Instagram AR filters for a cosmetics brand launch.", budgetRange: [1000, 2200] },
  { title: "Stationery Design", description: "Complete stationery set — letterhead, envelope, business card, ID card for a law firm.", budgetRange: [500, 1200] },
  { title: "Figma Prototype - Fintech App", description: "Create interactive Figma prototype for a payments app. Smooth transitions.", budgetRange: [2000, 4500] },
  { title: "Catalog Design", description: "Design a 50-page product catalog for a furniture company. Premium feel.", budgetRange: [1500, 3500] },
  { title: "AI Presentation Templates", description: "Design 10 AI-themed presentation templates for Google Slides and PowerPoint.", budgetRange: [600, 1400] },
  { title: "Exhibition Booth Design", description: "Design a 3D exhibition booth layout for a technology expo.", budgetRange: [1500, 3000] },
  { title: "Resume/CV Template Pack", description: "Design 10 modern resume templates in editable formats (Word, Figma).", budgetRange: [400, 1000] },
  { title: "Shopify Store Design", description: "Design custom Shopify theme for a jewelry e-commerce brand.", budgetRange: [1800, 4000] },
  { title: "Character Design for Animation", description: "Design 5 characters for an animated explainer video series.", budgetRange: [1200, 2800] },
  { title: "Newsletter Header Graphics", description: "Design 20 unique header graphics for weekly newsletter emails.", budgetRange: [400, 900] },
  { title: "QR Code Creative Design", description: "Design branded QR codes with artistic elements for restaurant menus.", budgetRange: [300, 700] },
  { title: "Podcast Cover Art", description: "Design cover art and episode thumbnails for a business podcast.", budgetRange: [400, 1000] },
  { title: "Canva Template Business", description: "Create 50 Canva templates (social posts, stories, reels covers) for resale.", budgetRange: [1200, 2500] },
  { title: "Data Visualization Design", description: "Create beautiful data viz graphics for a sustainability report.", budgetRange: [1000, 2200] },
  { title: "Chatbot Avatar Design", description: "Design a friendly AI assistant avatar with 10 expression variants.", budgetRange: [600, 1400] },
  { title: "WordPress Theme Customization", description: "Customize a WordPress theme for a travel blog. Unique homepage layout.", budgetRange: [800, 1800] },
  { title: "Packaging Mockup Creation", description: "Create photorealistic packaging mockups for 8 food products.", budgetRange: [700, 1500] },
  { title: "Signage Design", description: "Design indoor and outdoor signage for a new co-working space.", budgetRange: [800, 1800] },
  { title: "Video Editing & Thumbnails", description: "Edit 10 YouTube videos and design matching thumbnails for a vlog channel.", budgetRange: [1000, 2200] },
  { title: "Crypto Dashboard Design", description: "Design a cryptocurrency trading dashboard. Dark theme, real-time data display.", budgetRange: [2500, 5500] },
];

export function generateFakeJobs(): {
  title: string;
  budget: string;
  location: string;
  description: string;
  created_at: string;
}[] {
  const result: ReturnType<typeof generateFakeJobs> = [];
  const now = Date.now();
  const TEN_DAYS = 10 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < 105; i++) {
    const job = jobs[i % jobs.length];
    const city = cities[i % cities.length];
    const budgetLow = job.budgetRange[0] + Math.floor(Math.random() * 300);
    const budgetHigh = job.budgetRange[1] + Math.floor(Math.random() * 500);
    const createdAt = new Date(now - Math.floor(Math.random() * TEN_DAYS));

    result.push({
      title: i < jobs.length ? job.title : `${job.title} #${Math.floor(i / jobs.length) + 1}`,
      budget: `$${budgetLow.toLocaleString()} - $${budgetHigh.toLocaleString()}`,
      location: city,
      description: job.description,
      created_at: createdAt.toISOString(),
    });
  }

  // Sort newest first
  result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return result;
}
