import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { adminId } = await req.json().catch(() => ({ adminId: null }));

    let createdBy = adminId;
    if (!createdBy) {
      const { data: adminRole } = await supabase.from("user_roles").select("user_id").eq("role", "admin").limit(1).single();
      createdBy = adminRole?.user_id || "00000000-0000-0000-0000-000000000000";
    }

    const cities = [
      "New York", "London", "Toronto", "Sydney", "Berlin", "Dubai", "Singapore", "Los Angeles",
      "Paris", "Amsterdam", "Tokyo", "San Francisco", "Melbourne", "Stockholm", "Barcelona",
      "Austin", "Vancouver", "Seoul", "Cape Town", "Dublin", "Milan", "Lisbon", "Chicago",
      "Copenhagen", "Hong Kong",
    ];

    const areas: Record<string, string[]> = {
      "New York": ["Manhattan", "Brooklyn", "SoHo", "Upper East Side", "Chelsea", "Tribeca", "Williamsburg", "Midtown"],
      "London": ["Mayfair", "Chelsea", "Shoreditch", "Notting Hill", "Kensington", "Canary Wharf", "Soho", "Islington"],
      "Toronto": ["Yorkville", "King West", "Liberty Village", "The Annex", "Leslieville", "Queen West", "Midtown", "Distillery District"],
      "Sydney": ["Surry Hills", "Bondi", "Darlinghurst", "Newtown", "Paddington", "Mosman", "Manly", "Barangaroo"],
      "Berlin": ["Mitte", "Kreuzberg", "Prenzlauer Berg", "Charlottenburg", "Friedrichshain", "Schöneberg", "Neukölln", "Wilmersdorf"],
      "Dubai": ["Downtown", "Marina", "JBR", "Business Bay", "Palm Jumeirah", "DIFC", "Al Barsha", "Jumeirah"],
      "Singapore": ["Orchard", "Marina Bay", "Tanjong Pagar", "Tiong Bahru", "Holland Village", "Bukit Timah", "Sentosa", "Clarke Quay"],
      "Los Angeles": ["Beverly Hills", "Santa Monica", "West Hollywood", "Silver Lake", "Venice", "Brentwood", "Echo Park", "Studio City"],
      "Paris": ["Le Marais", "Saint-Germain", "Montmartre", "Bastille", "Opéra", "Champs-Élysées", "Belleville", "Pigalle"],
      "Amsterdam": ["Jordaan", "De Pijp", "Oud-Zuid", "Centrum", "Oost", "Noord", "Rivierenbuurt", "Plantage"],
      "Tokyo": ["Shibuya", "Shinjuku", "Roppongi", "Ginza", "Aoyama", "Minato", "Daikanyama", "Ebisu"],
      "San Francisco": ["SoMa", "Mission District", "Pacific Heights", "Marina", "Hayes Valley", "Nob Hill", "Castro", "Potrero Hill"],
      "Melbourne": ["Fitzroy", "South Yarra", "St Kilda", "Carlton", "Richmond", "Collingwood", "Prahran", "Brunswick"],
      "Stockholm": ["Östermalm", "Södermalm", "Norrmalm", "Vasastan", "Kungsholmen", "Gamla Stan", "Djurgården", "Hammarby"],
      "Barcelona": ["Eixample", "Gràcia", "Born", "Poble Sec", "Sarrià", "Sant Gervasi", "Barceloneta", "Poblenou"],
      "Austin": ["Downtown", "East Austin", "South Congress", "Zilker", "Clarksville", "Mueller", "Tarrytown", "Rainey Street"],
      "Vancouver": ["Yaletown", "Gastown", "Kitsilano", "West End", "Mount Pleasant", "Coal Harbour", "Main Street", "Kerrisdale"],
      "Seoul": ["Gangnam", "Itaewon", "Hongdae", "Bukchon", "Apgujeong", "Jamsil", "Mapo", "Samcheong"],
      "Cape Town": ["Camps Bay", "Sea Point", "Gardens", "Woodstock", "Green Point", "Constantia", "Newlands", "Hout Bay"],
      "Dublin": ["Temple Bar", "Ballsbridge", "Ranelagh", "Rathmines", "Drumcondra", "Sandymount", "Howth", "Dún Laoghaire"],
      "Milan": ["Brera", "Navigli", "Porta Nuova", "Isola", "Tortona", "Quadrilatero", "Porta Romana", "Lambrate"],
      "Lisbon": ["Chiado", "Alfama", "Príncipe Real", "Bairro Alto", "Santos", "Estrela", "Graça", "Belém"],
      "Chicago": ["Lincoln Park", "River North", "Wicker Park", "Gold Coast", "West Loop", "Logan Square", "Lakeview", "Bucktown"],
      "Copenhagen": ["Nørrebro", "Vesterbro", "Østerbro", "Frederiksberg", "Christianshavn", "Indre By", "Amager", "Islands Brygge"],
      "Hong Kong": ["Central", "Causeway Bay", "Tsim Sha Tsui", "Mid-Levels", "The Peak", "Wan Chai", "Stanley", "Soho"],
    };

    const jobs = [
      { title: "Complete Interior Design for 2-Bed Apartment", desc: "Looking for a designer for full interior design of a new 2-bedroom apartment (~950 sq ft). Need modular kitchen, wardrobes, TV unit, ceiling design, and flooring.", br: [120, 280] },
      { title: "2-Bed Apartment Renovation – Modern Makeover", desc: "10-year-old apartment needs a complete makeover. Want contemporary look with space-saving furniture, new kitchen layout, bathroom tiles replacement.", br: [100, 250] },
      { title: "Kitchen & Living Room Design", desc: "Need interior designer for modular kitchen design (L-shaped, soft-close fittings) and living room redesign with TV unit, accent wall, and seating arrangement.", br: [80, 200] },
      { title: "Full Interior Design for 3-Bed Premium Flat", desc: "Newly purchased 3-bedroom flat (1,450 sq ft) in a premium tower. Need complete interior — kitchen with island, master bedroom with walk-in wardrobe, kids room design.", br: [150, 320] },
      { title: "3-Bed Flat – Scandinavian Style Interiors", desc: "Want clean Scandinavian-inspired interiors for a 3-bedroom apartment. White oak finish, minimal furniture, lots of natural light. Need 3D renders before execution.", br: [180, 350] },
      { title: "Living & Dining Area Design – Spacious Apartment", desc: "Need help designing open-plan living and dining area. Want marble flooring, designer ceiling with cove lighting, and custom furniture. Area is approximately 400 sq ft.", br: [100, 220] },
      { title: "Luxury 4-Bed Penthouse Interior Design", desc: "4-bedroom penthouse (2,800 sq ft) with terrace needs luxury interior design. Italian marble, veneer wardrobes, home theatre, bar counter, and terrace garden.", br: [250, 450] },
      { title: "4-Bed Duplex – Complete Furnishing", desc: "Duplex apartment (3,200 sq ft) needs end-to-end interior work. Ground floor: living, dining, kitchen, guest room. Upper: 3 bedrooms, study, family lounge.", br: [200, 400] },
      { title: "Independent Villa Interior – 4 Bedrooms", desc: "3,500 sq ft independent villa with garden. Complete interior planning — all 4 bedrooms, 2 living areas, modular kitchen, prayer room, and outdoor seating.", br: [180, 350] },
      { title: "Weekend Villa Interior – Rustic Modern", desc: "Weekend villa (2,200 sq ft) needs rustic-modern interiors. Exposed brick walls, wooden beams, large windows. 3 bedrooms, open kitchen, and covered patio.", br: [150, 300] },
      { title: "Luxury Villa – Complete Interior Execution", desc: "5-bedroom luxury villa (4,500 sq ft) in gated community. Imported fittings, smart home integration, home gym, pool deck furniture, and landscape lighting.", br: [300, 500] },
      { title: "Townhouse Interior Design – 3 Bedrooms", desc: "Newly built townhouse (1,800 sq ft). Ground floor with living, dining, kitchen. First floor with 3 bedrooms. Rooftop entertainment area. Modern minimalist style.", br: [130, 280] },
      { title: "Heritage Home Renovation", desc: "30-year-old home needs renovation while preserving heritage elements. Update electrical, plumbing, modern kitchen, renovate bathrooms, new flooring. 3,000 sq ft.", br: [180, 350] },
      { title: "Corporate Office Interior – 2,000 sq ft", desc: "Setting up new corporate office for tech company. Need 15 workstations, 2 private offices, conference room (10-seater), reception area, pantry, and server room.", br: [150, 300] },
      { title: "Startup Office Design – Open Plan", desc: "Co-working style startup office (1,200 sq ft). Open desk layout for 20 people, 1 meeting room, phone booths, breakout zone, and pantry. Fun, colorful vibe.", br: [100, 220] },
      { title: "Professional Firm Office Interior", desc: "Professional office for consulting firm. 800 sq ft — partner cabin, associate seating for 8, client meeting room, reception with branding wall, and storage.", br: [80, 180] },
      { title: "Medical Clinic Interior Design", desc: "Setting up a dermatology clinic (1,500 sq ft). Waiting area (15 seats), reception, 3 consultation rooms, 1 procedure room, staff room, and washrooms.", br: [120, 260] },
      { title: "Restaurant Interior Design – 1,800 sq ft", desc: "New restaurant needs complete interior design. Seating for 60, open kitchen concept, bar counter, private dining area, washrooms, and exterior signage.", br: [180, 350] },
      { title: "Boutique Retail Store Design", desc: "Fashion boutique (600 sq ft) in shopping center needs interior design. Display shelving, fitting rooms (3), checkout counter, storage, and lighting plan.", br: [80, 180] },
      { title: "Gym & Fitness Studio Interior", desc: "2,500 sq ft gym space needs interior planning. Cardio zone, weight area, functional training, yoga room, locker rooms, reception, and supplement counter.", br: [130, 280] },
      { title: "Dental Clinic Setup", desc: "Converting ground floor space into dental clinic. 1,000 sq ft — 3 dental chairs, X-ray room, sterilization area, waiting lounge, and child-friendly section.", br: [100, 220] },
      { title: "Master Bedroom Design with En-Suite", desc: "Master bedroom (200 sq ft) + en-suite bathroom redesign. Upholstered bed wall, concealed wardrobe, vanity area, rain shower, and wall-hung WC. Luxury hotel feel.", br: [80, 180] },
      { title: "Modular Kitchen Design – Galley Layout", desc: "Need modular kitchen design for galley layout (100 sq ft). Acrylic finish, soft-close drawers, hood, built-in microwave space. Include 3D render.", br: [60, 150] },
      { title: "Kids Room Theme Design", desc: "Design themed kids room for a 6-year-old. Space or jungle theme with bunk bed, study table, wardrobe, and play area. Room is 120 sq ft.", br: [50, 120] },
      { title: "Home Office / Study Room Design", desc: "Converting spare bedroom (150 sq ft) into home office. L-shaped desk, bookshelves, video call backdrop, lighting plan, and soundproofing.", br: [60, 150] },
      { title: "Bathroom Renovation – Premium Finish", desc: "2 bathroom complete renovation in apartment. Wall-hung WC, rain shower, vanity with basin, anti-skid tiles, ceiling with exhaust. Premium fixtures.", br: [80, 180] },
      { title: "Balcony & Terrace Garden Design", desc: "L-shaped balcony (80 sq ft) + terrace (200 sq ft) needs landscaping and seating. Vertical garden, turf, swing seating, string lights, planters.", br: [50, 130] },
      { title: "Ceiling & Lighting Design – Full Apartment", desc: "Need ceiling design with lighting plan for entire 3-bedroom flat (1,400 sq ft). Cove lighting, spotlights, and statement chandelier in dining.", br: [70, 160] },
      { title: "3D Interior Visualization – 2-Bed Flat", desc: "Need photorealistic 3D renders for a 2-bedroom flat interior. All rooms including kitchen and bathrooms. Mood boards, material palette, and 8-10 render views.", br: [80, 180] },
      { title: "Interior Layout & Technical Drawings", desc: "Need detailed technical drawings for 3-bedroom villa interior. Floor plan, electrical, plumbing, ceiling plan, furniture layout, and elevations.", br: [100, 220] },
      { title: "Showroom Interior – Furniture Brand", desc: "3,000 sq ft showroom for premium furniture brand. Display zones, experience areas, lighting design, material library, and customer lounge.", br: [200, 400] },
      { title: "Coworking Space Design – 5,000 sq ft", desc: "New coworking space. Hot desks (40), dedicated desks (20), 5 meeting rooms, 2 board rooms, podcast room, café, nap pods, and event space.", br: [250, 450] },
      { title: "Boutique Hotel Interior – 15 Rooms", desc: "15-room boutique hotel needs interior design for all room categories (Standard, Deluxe, Suite). Lobby, restaurant, and rooftop bar included.", br: [280, 500] },
      { title: "School Classroom & Library Interior", desc: "International school needs design for 10 classrooms, library, computer lab, art room, and principal's office. Child-safe materials, professional.", br: [150, 300] },
      { title: "Event Venue / Banquet Hall Design", desc: "4,000 sq ft banquet hall needs interior upgrade. Main hall, pre-function area, bridal room, kitchen, and entrance lobby. Versatile for themes.", br: [200, 380] },
    ];

    const now = Date.now();
    const TEN_DAYS = 10 * 24 * 60 * 60 * 1000;
    const rows = [];

    for (let i = 0; i < 108; i++) {
      const job = jobs[i % jobs.length];
      const city = cities[i % cities.length];
      const cityAreas = areas[city] || [city];
      const area = cityAreas[Math.floor(Math.random() * cityAreas.length)];
      const budgetLow = job.br[0] + Math.floor(Math.random() * 30);
      const budgetHigh = job.br[1] + Math.floor(Math.random() * 50);
      const createdAt = new Date(now - Math.floor(Math.random() * TEN_DAYS));

      rows.push({
        title: job.title,
        budget: `$${budgetLow.toLocaleString("en-US")} - $${budgetHigh.toLocaleString("en-US")}`,
        location: `${area}, ${city}`,
        description: job.desc,
        created_by: createdBy,
        created_at: createdAt.toISOString(),
      });
    }

    // Delete old jobs first
    await supabase.from("freelance_interests").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("freelance_projects").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const { error } = await supabase.from("freelance_projects").insert(rows);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true, inserted: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
