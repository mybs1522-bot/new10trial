import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users, Calendar, Briefcase, MessageSquare, Award, BookOpen,
  Plus, Trash2, Send, Shield, LogOut,
  CheckSquare, Lock, Unlock, Mail, Zap, Pencil, Check, X, Loader2, MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const GOLD_BTN = { background: "linear-gradient(135deg, hsl(38,62%,61%), hsl(38,62%,50%))" } as const;
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PremiumFormWrapper, itemVariants } from "@/components/PremiumFormWrapper";
import { PremiumInput, PremiumSelect, PremiumTextarea } from "@/components/PremiumFormComponents";
import { motion } from "framer-motion";


interface Student {
  id: string;
  full_name: string;
  phone: string;
  location: string;
  mode: string;
  has_paid: boolean;
  created_at: string;
  email: string;
}

interface SiteVisitForm {
  title: string;
  location: string;
  visit_date: string;
  visit_time: string;
  description: string;
}

interface FreelanceForm {
  title: string;
  budget: string;
  location: string;
  description: string;
}

export default function AdminDashboard() {
  const { signOut, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");
  const [visits, setVisits] = useState<any[]>([]);
  const [freelanceProjects, setFreelanceProjects] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);

  const [visitForm, setVisitForm] = useState<SiteVisitForm>({ title: "", location: "", visit_date: "", visit_time: "", description: "" });
  const [freelanceForm, setFreelanceForm] = useState<FreelanceForm>({ title: "", budget: "", location: "", description: "" });
  const [editingFreelance, setEditingFreelance] = useState<string | null>(null);
  const [editFreelanceForm, setEditFreelanceForm] = useState<FreelanceForm>({ title: "", budget: "", location: "", description: "" });
  const [seedingJobs, setSeedingJobs] = useState(false);
  const [deletingAllJobs, setDeletingAllJobs] = useState(false);
  const [jobInquiries, setJobInquiries] = useState<any[]>([]);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [directMsg, setDirectMsg] = useState("");

  // Email state
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailTo, setEmailTo] = useState<"all" | "paid" | "specific">("all");
  const [emailStudent, setEmailStudent] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState("");

  // Cert form
  const [certForm, setCertForm] = useState({ student_id: "", course_name: "", issue_date: new Date().toISOString().split("T")[0] });

  // Drip email state
  const [dripTemplates, setDripTemplates] = useState<any[]>([]);
  const [dripQueue, setDripQueue] = useState<any[]>([]);
  const [editingDrip, setEditingDrip] = useState<string | null>(null);
  const [dripEdit, setDripEdit] = useState<{ subject: string; html: string }>({ subject: "", html: "" });
  const [dripLoading, setDripLoading] = useState(false);


  useEffect(() => {
    if (!loading && !isAdmin) navigate("/dashboard");
  }, [isAdmin, loading]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [
      { data: studentsData },
      { data: visitsData },
      { data: projectsData },
      { data: msgsData },
      { data: interestsData },
      { data: certsData },
      { data: dripTemplatesData },
      { data: dripQueueData },
    ] = await Promise.all([
      supabase.rpc("get_profiles_with_email"),
      supabase.from("site_visits").select("*").order("visit_date"),
      supabase.from("freelance_projects").select("*").order("created_at", { ascending: false }),
      supabase.from("messages").select("*").order("created_at", { ascending: false }),
      supabase.from("freelance_interests").select("*"),
      supabase.from("certificates").select("*"),
      supabase.from("email_drip_templates").select("*").order("delay_hours"),
      supabase.from("email_drip_queue").select("*").order("scheduled_at", { ascending: false }).limit(200),
    ]);
    const profiles = studentsData || [];
    setStudents(profiles);
    setVisits(visitsData || []);
    setFreelanceProjects(projectsData || []);
    const allMsgs = msgsData || [];
    setMessages(allMsgs);
    setJobInquiries(allMsgs.filter((m: any) => m.content?.startsWith("[Job Inquiry:")));
    setDripTemplates(dripTemplatesData || []);
    setDripQueue(dripQueueData || []);

    // Manually join interests with profiles and projects
    const enrichedInterests = (interestsData || []).map((i: any) => ({
      ...i,
      profiles: { full_name: profiles.find((p) => p.id === i.student_id)?.full_name || "—" },
      freelance_projects: { title: (projectsData || []).find((p: any) => p.id === i.project_id)?.title || "—" },
    }));
    setInterests(enrichedInterests);

    // Manually join certs with profiles
    const enrichedCerts = (certsData || []).map((c: any) => ({
      ...c,
      profiles: { full_name: profiles.find((p) => p.id === c.student_id)?.full_name || "—" },
    }));
    setCerts(enrichedCerts);
  };

  const saveDripTemplate = async (id: string) => {
    setDripLoading(true);
    const { error } = await supabase
      .from("email_drip_templates")
      .update({ subject: dripEdit.subject, html: dripEdit.html })
      .eq("id", id);
    if (!error) {
      setDripTemplates((prev) => prev.map((t) => t.id === id ? { ...t, ...dripEdit } : t));
      setEditingDrip(null);
      toast({ title: "Template saved ✅" });
    } else {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    }
    setDripLoading(false);
  };

  const toggleDripTemplate = async (id: string, enabled: boolean) => {
    await supabase.from("email_drip_templates").update({ enabled: !enabled }).eq("id", id);
    setDripTemplates((prev) => prev.map((t) => t.id === id ? { ...t, enabled: !enabled } : t));
    toast({ title: enabled ? "Email disabled" : "Email enabled ✅" });
  };

  const triggerDripNow = async () => {
    setDripLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-drip-emails");
      if (error) throw error;
      toast({ title: `Processed ✅`, description: `Sent: ${data.sent}, Failed: ${data.failed}` });
      fetchAll();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setDripLoading(false);
  };

  const togglePayment = async (studentId: string, hasPaid: boolean) => {
    const { error } = await supabase.from("profiles").update({ has_paid: !hasPaid }).eq("id", studentId);
    if (!error) {
      setStudents((prev) => prev.map((s) => s.id === studentId ? { ...s, has_paid: !hasPaid } : s));
      toast({ title: hasPaid ? "Access revoked" : "Access granted ✅" });
    }
  };

  const sendWhatsAppReminder = (student: Student) => {
    const digits = (student.phone || "").replace(/[^0-9]/g, "");
    if (!digits) {
      toast({ title: "No phone number", description: "This student doesn't have a phone number on file.", variant: "destructive" });
      return;
    }
    const firstName = student.full_name?.trim().split(" ")[0] || "";
    const message = `Hey ${firstName} 👋

You signed up at start.avadalearn.com but haven't started your 3-day free trial yet.

We just added new AI courses that help you create renders exactly like your own design concepts — faster and client-ready.

Plus, you get access to complete Interior Design books covering living room, kitchen, bedroom, washroom, exterior — every major space in detail.

If you're serious about upgrading your design game, don't leave this unused.

Activate your 3-day trial here 👉 https://start.avadalearn.com

Need help getting started? Just reply here — I'll assist you. 🚀`;

    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const addVisit = async () => {
    if (!visitForm.title || !visitForm.location || !visitForm.visit_date || !visitForm.visit_time) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("site_visits").insert({ ...visitForm, created_by: user?.id ?? null });
    if (!error) {
      toast({ title: "Site visit added ✅" });
      setVisitForm({ title: "", location: "", visit_date: "", visit_time: "", description: "" });
      fetchAll();
    } else {
      toast({ title: "Failed to add visit", description: error.message, variant: "destructive" });
    }
  };

  const deleteVisit = async (id: string) => {
    await supabase.from("site_visits").delete().eq("id", id);
    fetchAll();
  };

  const addFreelance = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("freelance_projects").insert({ ...freelanceForm, created_by: user?.id });
    if (!error) {
      toast({ title: "Job posted ✅" });
      setFreelanceForm({ title: "", budget: "", location: "", description: "" });
      fetchAll();
    }
  };

  const deleteFreelance = async (id: string) => {
    await supabase.from("freelance_interests").delete().eq("project_id", id);
    await supabase.from("freelance_projects").delete().eq("id", id);
    toast({ title: "Listing deleted" });
    fetchAll();
  };

  const updateFreelance = async (id: string) => {
    const { error } = await supabase.from("freelance_projects").update(editFreelanceForm).eq("id", id);
    if (!error) {
      toast({ title: "Listing updated ✅" });
      setEditingFreelance(null);
      fetchAll();
    } else {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  };

  const seedFakeJobs = async () => {
    setSeedingJobs(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const createdBy = user?.id || "00000000-0000-0000-0000-000000000000";

      const cities = [
        "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad",
        "Jaipur", "Lucknow", "Chandigarh", "Gurgaon", "Noida", "Kochi", "Indore", "Nagpur",
        "Bhopal", "Coimbatore", "Vadodara", "Surat", "Thiruvananthapuram", "Visakhapatnam",
        "Mysore", "Udaipur", "Goa",
      ];
      const areas: Record<string, string[]> = {
        Mumbai: ["Andheri West", "Bandra East", "Powai", "Worli", "Juhu", "Goregaon East", "Lower Parel", "Malad West"],
        Delhi: ["Vasant Kunj", "Greater Kailash", "Dwarka Sector 21", "Saket", "Hauz Khas", "Rohini Sector 9", "Janakpuri", "Defence Colony"],
        Bangalore: ["Whitefield", "Koramangala", "Indiranagar", "HSR Layout", "JP Nagar", "Electronic City", "Hebbal", "Sarjapur Road"],
        Hyderabad: ["Banjara Hills", "Jubilee Hills", "Gachibowli", "Kondapur", "Madhapur", "Kukatpally", "Hitech City", "Miyapur"],
        Chennai: ["Anna Nagar", "Adyar", "T. Nagar", "Velachery", "OMR", "ECR", "Nungambakkam", "Besant Nagar"],
        Pune: ["Koregaon Park", "Baner", "Hinjewadi", "Kharadi", "Viman Nagar", "Wakad", "Aundh", "Hadapsar"],
        Kolkata: ["Salt Lake", "New Town", "Alipore", "Ballygunge", "Park Street", "Rajarhat", "EM Bypass", "Behala"],
        Ahmedabad: ["Bodakdev", "Satellite", "SG Highway", "Prahlad Nagar", "Vastrapur", "Thaltej", "Ambli Road", "Navrangpura"],
        Jaipur: ["C-Scheme", "Malviya Nagar", "Vaishali Nagar", "Mansarovar", "Tonk Road", "Jagatpura", "Ajmer Road", "Bani Park"],
        Lucknow: ["Gomti Nagar", "Hazratganj", "Aliganj", "Indira Nagar", "Mahanagar", "Vikas Nagar", "Jankipuram", "Alambagh"],
        Chandigarh: ["Sector 17", "Sector 35", "Sector 43", "Manimajra", "Zirakpur", "Panchkula", "Mohali Phase 7", "Sector 22"],
        Gurgaon: ["DLF Phase 1", "Golf Course Road", "Sector 56", "Sohna Road", "MG Road", "Sector 49", "Sector 82", "South City"],
        Noida: ["Sector 137", "Sector 62", "Sector 150", "Greater Noida West", "Sector 44", "Sector 75", "Expressway", "Sector 128"],
        Kochi: ["Edappally", "Kakkanad", "Marine Drive", "Vyttila", "Aluva", "Thrippunithura", "Panampilly Nagar", "Kaloor"],
        Indore: ["Vijay Nagar", "Palasia", "AB Road", "Nipania", "Bhawarkuan", "Rau", "Sapna Sangeeta", "Scheme 54"],
        Nagpur: ["Dharampeth", "Civil Lines", "Sadar", "Sitabuldi", "Mankapur", "Wardha Road", "Ramdaspeth", "Laxmi Nagar"],
        Bhopal: ["Arera Colony", "MP Nagar", "Kolar Road", "Hoshangabad Road", "Shahpura", "Bairagarh", "TT Nagar", "New Market"],
        Coimbatore: ["RS Puram", "Peelamedu", "Saravanampatti", "Gandhipuram", "Race Course", "Singanallur", "Ganapathy", "Hopes College"],
        Vadodara: ["Alkapuri", "Gotri", "Manjalpur", "Akota", "Old Padra Road", "Waghodia Road", "Vasna", "Tarsali"],
        Surat: ["Vesu", "Adajan", "Piplod", "Athwa", "City Light", "Pal", "Althan", "Katargam"],
        Thiruvananthapuram: ["Kowdiar", "Pattom", "Vellayambalam", "Vazhuthacaud", "Kesavadasapuram", "Kazhakkoottam", "Ulloor", "Sasthamangalam"],
        Visakhapatnam: ["MVP Colony", "Madhurawada", "Seethammadhara", "Gajuwaka", "Rushikonda", "Dwaraka Nagar", "Lawsons Bay", "Beach Road"],
        Mysore: ["Vijayanagar", "Gokulam", "Jayalakshmipuram", "Saraswathipuram", "Kuvempunagar", "Hebbal", "JP Nagar", "Lakshmipuram"],
        Udaipur: ["Fatehpura", "Hiran Magri", "Shobhagpura", "Ambamata", "Pratap Nagar", "Bhuwana", "Bedla", "Sukher"],
        Goa: ["Panaji", "Margao", "Dona Paula", "Calangute", "Mapusa", "Ponda", "Vasco", "Porvorim"],
      };
      const clientNames = [
        "Mr. Rajesh Sharma", "Mrs. Priya Mehta", "Mr. Vikram Singh", "Mrs. Ananya Gupta", "Mr. Arjun Patel",
        "Mrs. Sneha Reddy", "Mr. Karthik Nair", "Mrs. Deepika Joshi", "Mr. Sanjay Agarwal", "Mrs. Kavya Iyer",
        "Mr. Rohit Kapoor", "Mrs. Swati Bhatt", "Mr. Amit Deshmukh", "Mrs. Pooja Menon", "Mr. Rahul Verma",
        "Mr. Suresh Pillai", "Mrs. Neha Saxena", "Mr. Manish Tiwari", "Mrs. Ritu Malhotra", "Mr. Ajay Chauhan",
        "Dr. Sunita Rao", "Mr. Nikhil Bansal", "Mrs. Meera Kulkarni", "Mr. Gaurav Sinha", "Mrs. Divya Pandey",
        "Mr. Anil Bhatia", "Mrs. Shalini Prasad", "Mr. Vivek Khanna", "Mrs. Nandini Das", "Mr. Rakesh Jain",
      ];
      const jobs = [
        { title: "Complete Interior Design for 2BHK Flat", desc: "Full interior design for 2BHK flat (~950 sq ft). Modular kitchen, wardrobes, TV unit, false ceiling, flooring. Vastu-compliant layout. Family of 4.", br: [3, 6] },
        { title: "2BHK Flat Renovation – Modern Makeover", desc: "10-year-old 2BHK needs complete makeover. Contemporary look, space-saving furniture, new kitchen, bathroom tiles, fresh paint.", br: [2, 4] },
        { title: "Kitchen & Living Room Design – 2BHK", desc: "Modular kitchen (L-shaped, soft-close) and living room redesign with TV unit, accent wall. 850 sq ft gated society.", br: [1, 3] },
        { title: "Full Interior Design for 3BHK Premium Flat", desc: "3BHK flat (1450 sq ft) premium tower. Modular kitchen with island, walk-in wardrobe, kids room theme, living-dining partition.", br: [5, 10] },
        { title: "3BHK Flat – Scandinavian Style Interiors", desc: "Scandinavian-inspired interiors for 3BHK. White oak finish, minimal furniture, natural light. 3D renders needed. Bare shell.", br: [6, 12] },
        { title: "Living & Dining Area Design – Spacious 3BHK", desc: "Open-plan living and dining for 3BHK. Italian marble flooring, designer false ceiling, custom furniture. ~400 sq ft.", br: [4, 8] },
        { title: "Luxury 4BHK Penthouse Interior Design", desc: "4BHK penthouse (2800 sq ft) with terrace. Italian marble, veneer wardrobes, home theatre, bar counter, terrace garden.", br: [12, 25] },
        { title: "4BHK Duplex Flat – Complete Furnishing", desc: "Duplex (3200 sq ft). Ground: living, dining, kitchen, guest room. Upper: 3 bedrooms, study, lounge. Staircase design.", br: [10, 20] },
        { title: "Independent Villa Interior Design – 4BHK", desc: "3500 sq ft villa with garden. 4 bedrooms, 2 living areas, modular kitchen, puja room, outdoor seating. Contemporary Indian.", br: [8, 18] },
        { title: "Farmhouse Villa Interior – Weekend Home", desc: "Weekend farmhouse (2200 sq ft). Rustic-modern interiors, exposed brick, wooden beams, 3 bedrooms, open kitchen, patio.", br: [6, 14] },
        { title: "Luxury Villa – Complete Interior Execution", desc: "5BHK luxury villa (4500 sq ft). Imported fittings, smart home, home gym, pool deck, landscape lighting.", br: [15, 35] },
        { title: "Row House Interior Design – 3BHK", desc: "Row house (1800 sq ft). Ground: living, dining, kitchen. First floor: 3 bedrooms. Terrace BBQ. Modern minimalist.", br: [5, 12] },
        { title: "Villa Renovation – Heritage Style Update", desc: "30-year-old villa renovation preserving heritage. Modern kitchen, renovated bathrooms, new flooring. 3000 sq ft.", br: [8, 16] },
        { title: "Corporate Office Interior – 2000 sq ft", desc: "IT company office. 15 workstations, 2 cabins, conference room, reception, pantry, server room. Tech aesthetic.", br: [6, 14] },
        { title: "Startup Office Design – Open Plan", desc: "Startup office (1200 sq ft). 20 desks, meeting room, phone booths, breakout zone, pantry. Fun vibe, good acoustics.", br: [4, 9] },
        { title: "CA/Law Firm Office Interior", desc: "CA firm office (800 sq ft). Partner cabin, 8 associate seats, meeting room, reception, document storage.", br: [3, 7] },
        { title: "Medical Clinic Interior Design", desc: "Dermatology clinic (1500 sq ft). Waiting area, reception, 3 consultation rooms, procedure room, staff room.", br: [5, 12] },
        { title: "Restaurant Interior Design – 1800 sq ft", desc: "North Indian restaurant. Seating for 60, open kitchen, bar counter, private dining, washrooms, facade design.", br: [7, 15] },
        { title: "Boutique Retail Store Design", desc: "Fashion boutique (600 sq ft) in mall. Display shelving, 3 trial rooms, billing counter, lighting plan.", br: [2, 5] },
        { title: "Gym & Fitness Studio Interior", desc: "2500 sq ft gym. Cardio zone, weights, functional training, yoga room, locker rooms, reception.", br: [5, 11] },
        { title: "Dental Clinic Setup – Ground Floor", desc: "Ground floor to dental clinic (1000 sq ft). 3 chairs, X-ray room, sterilization, waiting lounge.", br: [4, 9] },
        { title: "Master Bedroom Design with Bathroom", desc: "Master bedroom (200 sq ft) + bathroom. Upholstered bed wall, concealed wardrobe, rain shower. Luxury hotel feel.", br: [2, 4] },
        { title: "Modular Kitchen Design – Parallel Layout", desc: "Parallel kitchen (100 sq ft). Acrylic finish, soft-close, chimney, built-in microwave, tall unit. 3D render.", br: [1, 3] },
        { title: "Kids Room Theme Design – Space/Jungle", desc: "Themed kids room for 6-year-old. Bunk bed, study table, wardrobe, play area. 120 sq ft.", br: [1, 2] },
        { title: "Home Office / Study Room Design", desc: "Spare bedroom (150 sq ft) to home office. L-shaped desk, bookshelves, video call backdrop, soundproofing.", br: [1, 2] },
        { title: "Puja Room & Foyer Design", desc: "Puja room (corian temple, backlit panel) and foyer with shoe rack, mirror, console table.", br: [1, 2] },
        { title: "Bathroom Renovation – Premium Finish", desc: "2 bathrooms in 3BHK. Wall-hung WC, rain shower, vanity, anti-skid tiles, false ceiling.", br: [2, 4] },
        { title: "Balcony & Terrace Garden Design", desc: "Balcony (80 sq ft) + terrace (200 sq ft). Vertical garden, artificial turf, swing, fairy lights.", br: [1, 2] },
        { title: "False Ceiling & Lighting Design – Full Flat", desc: "Full 3BHK flat (1400 sq ft) false ceiling. Gypsum/POP, cove lighting, spotlights, chandelier.", br: [1, 3] },
        { title: "3D Interior Visualization – 2BHK Flat", desc: "Photorealistic 3D renders for 2BHK. All rooms. Mood boards, material palette, 8-10 renders.", br: [1, 2] },
        { title: "Interior Layout & AutoCAD Drawings", desc: "AutoCAD drawings for 3BHK villa. Floor plan, electrical, plumbing, ceiling, furniture, elevations.", br: [2, 4] },
        { title: "Vastu-Compliant Interior Planning", desc: "Vastu expert for 3BHK layout. Kitchen, bedroom directions, puja room, color scheme per Vastu.", br: [1, 3] },
        { title: "Showroom Interior – Furniture Brand", desc: "3000 sq ft showroom for premium furniture. Display zones, experience areas, lighting, customer lounge.", br: [8, 18] },
        { title: "Coworking Space Design – 5000 sq ft", desc: "Coworking space. 40 hot desks, 20 dedicated, 5 meeting rooms, podcast room, cafe, nap pods.", br: [10, 22] },
        { title: "Hotel Room Interior – Boutique Hotel", desc: "15-room boutique hotel. Standard, Deluxe, Suite rooms. Lobby, restaurant, rooftop bar. Heritage building.", br: [12, 28] },
        { title: "School Classroom & Library Interior", desc: "International school. 10 classrooms, library, computer lab, art room, principal's office.", br: [6, 14] },
        { title: "Wedding Venue / Banquet Hall Design", desc: "4000 sq ft banquet hall. Main hall, pre-function area, bridal room, kitchen, entrance lobby.", br: [8, 18] },
      ];

      const now = Date.now();
      const JAN_25 = new Date("2026-01-25T00:00:00Z").getTime();
      const SPREAD = now - JAN_25; // spread from Jan 25 to today
      const rows: Array<{ title: string; budget: string; location: string; description: string; created_by: string; created_at: string }> = [];

      for (let i = 0; i < 108; i++) {
        const job = jobs[i % jobs.length];
        const city = cities[i % cities.length];
        const cityAreas = areas[city] || [city];
        const area = cityAreas[Math.floor(Math.random() * cityAreas.length)];
        const client = clientNames[i % clientNames.length];
        const budgetLow = job.br[0] + Math.floor(Math.random() * 2);
        const budgetHigh = job.br[1] + Math.floor(Math.random() * 3);
        const createdAt = new Date(JAN_25 + Math.floor(Math.random() * SPREAD));
        const daysAgo = Math.floor((now - createdAt.getTime()) / 86400000);

        rows.push({
          title: job.title,
          budget: `₹${budgetLow}L - ₹${budgetHigh}L`,
          location: `${area}, ${city}`,
          description: `${job.desc} — Client: ${client}. Posted ${daysAgo === 0 ? "today" : daysAgo + " days ago"}.`,
          created_by: createdBy,
          created_at: createdAt.toISOString(),
        });
      }

      // Insert in batches of 25 to avoid payload limits
      for (let i = 0; i < rows.length; i += 25) {
        const batch = rows.slice(i, i + 25);
        const { error } = await supabase.from("freelance_projects").insert(batch);
        if (error) throw error;
      }

      toast({ title: `${rows.length} jobs seeded! 🎉` });
      fetchAll();
    } catch (e: any) {
      toast({ title: "Seed failed", description: e.message, variant: "destructive" });
    }
    setSeedingJobs(false);
  };

  const sendBroadcast = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!broadcastMsg.trim() || !user) return;
    await supabase.from("messages").insert({ sender_id: user.id, is_broadcast: true, content: broadcastMsg });
    setBroadcastMsg("");
    toast({ title: "Broadcast sent 📢" });
    fetchAll();
  };

  const sendDirect = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!directMsg.trim() || !selectedStudent || !user) return;
    await supabase.from("messages").insert({ sender_id: user.id, receiver_id: selectedStudent, content: directMsg });
    setDirectMsg("");
    toast({ title: "Message sent ✅" });
    fetchAll();
  };

  const issueCert = async () => {
    if (!certForm.student_id || !certForm.course_name) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("certificates").insert({
      student_id: certForm.student_id,
      course_name: certForm.course_name,
      issue_date: certForm.issue_date,
      issued_by: user?.id,
    });
    if (!error) {
      toast({ title: "Certificate issued ✅" });
      setCertForm({ student_id: "", course_name: "", issue_date: new Date().toISOString().split("T")[0] });
      fetchAll();
    } else {
      toast({ title: "Failed to issue certificate", description: error.message, variant: "destructive" });
    }
  };

  const deleteCert = async (id: string) => {
    await supabase.from("certificates").delete().eq("id", id);
    fetchAll();
  };

  const filteredStudents = students.filter((s) => filter === "all" ? true : s.mode === filter);

  const sendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast({ title: "Please fill in subject and message", variant: "destructive" });
      return;
    }
    setEmailLoading(true);

    let recipients: string[] = [];
    if (emailTo === "specific") {
      if (customEmail.trim()) {
        recipients = [customEmail.trim()];
      } else if (emailStudent) {
        const student = students.find((s) => s.id === emailStudent);
        // We don't store email in profiles; use auth email lookup via edge fn
        // For now, use the custom email field as fallback
        toast({ title: "Please use the 'Custom email' field for specific recipients", variant: "destructive" });
        setEmailLoading(false);
        return;
      }
    } else {
      // Fetch emails from auth (requires service role — use edge fn approach)
      // We'll pass student IDs and resolve in edge fn
      recipients = emailTo === "paid"
        ? students.filter((s) => s.has_paid).map((s) => s.id)
        : students.map((s) => s.id);
    }

    try {
      const { data, error } = await supabase.functions.invoke("send-email-bulk", {
        body: {
          subject: emailSubject,
          html: emailBody.replace(/\n/g, "<br>"),
          studentIds: emailTo !== "specific" ? recipients : undefined,
          to: emailTo === "specific" ? recipients : undefined,
        },
      });

      if (error) throw error;
      toast({ title: `Email sent successfully! 📧`, description: `Sent to ${data?.sent ?? "all"} students.` });
      setEmailSubject("");
      setEmailBody("");
      setCustomEmail("");
    } catch (err: any) {
      toast({ title: "Failed to send email", description: err.message, variant: "destructive" });
    }
    setEmailLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 h-20 flex items-center px-8 justify-between shadow-glass">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 btn-gold rounded-xl flex items-center justify-center shadow-gold">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black tracking-[0.2em] text-accent uppercase">Command Center</p>
            <h1 className="text-sm font-black text-foreground tracking-tight uppercase -mt-1">Execution Administration</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">
            Student Access
          </Button>
          <Button variant="outline" size="sm" onClick={signOut} className="rounded-full text-[10px] font-black uppercase tracking-widest bg-muted/30 border-white/5 hover:bg-muted/50 transition-all">
            <LogOut className="h-3.5 w-3.5 mr-2" />Terminate Session
          </Button>
        </div>
      </header>

      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Students", value: students.length, icon: Users, color: "text-blue-500" },
            { label: "Paid Access", value: students.filter((s) => s.has_paid).length, icon: CheckSquare, color: "text-green-500" },
            { label: "Site Visits", value: visits.length, icon: Calendar, color: "text-accent" },
            { label: "Freelance Posts", value: freelanceProjects.length, icon: Briefcase, color: "text-purple-500" },
          ].map((stat) => (
            <div key={stat.label} className="premium-card p-6 border-white/5 group hover:border-accent/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`h-5 w-5 ${stat.color} opacity-80 group-hover:scale-110 transition-transform`} />
                <div className="h-1.5 w-1.5 rounded-full bg-accent/20" />
              </div>
              <p className="text-3xl font-black text-foreground tracking-tighter mb-1">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="students">
          <div className="overflow-x-auto pb-4 mb-8">
            <TabsList className="bg-muted/30 border border-white/5 rounded-2xl h-auto p-1.5 flex gap-1.5 w-max">
              {[
                { value: "students", label: "Students", icon: Users },
                { value: "visits", label: "Site Visits", icon: Calendar },
                { value: "freelance", label: "Freelance", icon: Briefcase },
                { value: "messages", label: "Messages", icon: MessageSquare },
                { value: "certificates", label: "Certificates", icon: Award },
                { value: "interests", label: "Interests", icon: BookOpen },
                { value: "email", label: "Email", icon: Mail },
                { value: "drip", label: "Drip", icon: Zap },
              ].map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="rounded-xl text-[10px] uppercase font-black tracking-widest flex items-center gap-2 px-6 py-3 data-[state=active]:bg-accent data-[state=active]:text-white transition-all">
                  <tab.icon className="h-3.5 w-3.5" />{tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── STUDENTS ── */}
          <TabsContent value="students" className="mt-0">
            <div className="premium-card !p-0 border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between"
                style={{ background: "linear-gradient(to bottom, hsl(220 20% 8%), hsl(220 20% 6%))" }}>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">Base Records</h2>
                  <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-1 opacity-70">Enrolled Operatives: {filteredStudents.length}</p>
                </div>
                <div className="flex gap-2 bg-muted/30 p-1 rounded-full border border-white/5">
                  {(["all", "online", "offline"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? "btn-gold text-white shadow-gold" : "text-muted-foreground hover:text-white"
                        }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-muted/10">
                      <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID / Status</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden md:table-cell">Contact</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden md:table-cell">Deployment</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Training Mode</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Activation Date</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Access Level</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/10 transition-colors group">
                        <td className="px-6 py-5">
                          <p className="text-[13px] font-black text-white tracking-tight uppercase">{s.full_name || "UNIDENTIFIED"}</p>
                        </td>
                        <td className="px-6 py-5 hidden md:table-cell">
                          <p className="text-[11px] font-black text-muted-foreground tracking-tight">{s.email || "—"}</p>
                          <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase mt-0.5 opacity-60">{s.phone || "—"}</p>
                        </td>
                        <td className="px-6 py-5 text-[11px] font-black text-muted-foreground hidden md:table-cell uppercase tracking-tight">{s.location || "—"}</td>
                        <td className="px-6 py-5">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border-t",
                            s.mode === "offline"
                              ? "bg-amber-500/5 text-amber-500 border-amber-500/20"
                              : "bg-blue-500/5 text-blue-500 border-blue-500/20"
                          )}>
                            {s.mode || "PENDING"}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-tight">
                          {new Date(s.created_at).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() => togglePayment(s.id, s.has_paid)}
                            className={cn(
                              "inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all border-t",
                              s.has_paid
                                ? "bg-green-500/5 text-green-500 border-green-500/20 hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/20"
                                : "bg-muted/30 text-muted-foreground border-white/5 hover:bg-green-500/5 hover:text-green-500 hover:border-green-500/20"
                            )}
                          >
                            {s.has_paid ? <><Unlock className="h-3 w-3" />Active Access</> : <><Lock className="h-3 w-3" />Locked Status</>}
                          </button>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button
                            onClick={() => sendWhatsAppReminder(s)}
                            title={`Send WhatsApp reminder to ${s.full_name}`}
                            className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all border-t bg-[#25D366]/5 text-[#25D366] border-[#25D366]/20 hover:bg-[#25D366]/15 hover:scale-105"
                          >
                            <MessageCircle className="h-3 w-3" />WhatsApp
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredStudents.length === 0 && (
                  <div className="text-center py-20">
                    <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground opacity-50">No records found within current parameters</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── SITE VISITS ── */}
          <TabsContent value="visits" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add form */}
              <PremiumFormWrapper
                title="Schedule Site Mission"
                subtitle="Deploy real-world learning experience"
                icon={<Plus className="h-4 w-4 text-accent" />}
              >
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); addVisit(); }}>
                  <PremiumInput
                    label="Mission Title"
                    placeholder="Execution Phase Alpha"
                    value={visitForm.title}
                    onChange={(e) => setVisitForm((f) => ({ ...f, title: e.target.value }))}
                  />
                  <PremiumInput
                    label="Deployment Location"
                    placeholder="South Delhi Sector 4"
                    value={visitForm.location}
                    onChange={(e) => setVisitForm((f) => ({ ...f, location: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <PremiumInput
                      label="Date"
                      type="date"
                      value={visitForm.visit_date}
                      onChange={(e) => setVisitForm((f) => ({ ...f, visit_date: e.target.value }))}
                    />
                    <PremiumInput
                      label="Time"
                      type="time"
                      value={visitForm.visit_time}
                      onChange={(e) => setVisitForm((f) => ({ ...f, visit_time: e.target.value }))}
                    />
                  </div>
                  <PremiumInput
                    label="Briefing"
                    placeholder="Essential context for operatives"
                    value={visitForm.description}
                    onChange={(e) => setVisitForm((f) => ({ ...f, description: e.target.value }))}
                  />
                  <motion.div variants={itemVariants}>
                    <Button type="submit" className="w-full h-14 rounded-full btn-gold text-white font-black text-xs uppercase tracking-[0.2em] shadow-gold-lg hover:scale-[1.02] transition-all">
                      Establish Mission
                    </Button>
                  </motion.div>
                </form>
              </PremiumFormWrapper>

              {/* Visit list */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-2 px-2">Active Deployments</h3>
                {visits.map((v) => (
                  <div key={v.id} className="premium-card p-5 border-white/5 flex items-center justify-between gap-4 group hover:border-accent/20 transition-all">
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-tight">{v.title}</p>
                      <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-1 opacity-70">
                        {v.location} · {new Date(v.visit_date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })} @ {v.visit_time}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteVisit(v.id)}
                      className="h-9 w-9 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/5 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {visits.length === 0 && (
                  <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-white/5 px-8">
                    <Calendar className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">No site missions currently scheduled</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── FREELANCE ── */}
          <TabsContent value="freelance" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <PremiumFormWrapper
                  title="Add Job Listing"
                  subtitle="Post a new design job opportunity"
                  icon={<Plus className="h-4 w-4 text-accent" />}
                >
                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); addFreelance(); }}>
                    <PremiumInput label="Job Title" placeholder="Logo Design for Startup" value={freelanceForm.title} onChange={(e) => setFreelanceForm((f) => ({ ...f, title: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-4">
                      <PremiumInput label="Budget" placeholder="₹15k - ₹25k" value={freelanceForm.budget} onChange={(e) => setFreelanceForm((f) => ({ ...f, budget: e.target.value }))} />
                      <PremiumInput label="City" placeholder="Mumbai" value={freelanceForm.location} onChange={(e) => setFreelanceForm((f) => ({ ...f, location: e.target.value }))} />
                    </div>
                    <PremiumTextarea label="Description" placeholder="Detailed job requirements..." value={freelanceForm.description} onChange={(e) => setFreelanceForm((f) => ({ ...f, description: e.target.value }))} rows={4} />
                    <motion.div variants={itemVariants}>
                      <Button type="submit" className="w-full h-14 rounded-full btn-gold text-white font-black text-xs uppercase tracking-[0.2em] shadow-gold-lg hover:scale-[1.02] transition-all">
                        Post Job
                      </Button>
                    </motion.div>
                  </form>
                </PremiumFormWrapper>

                <div className="flex gap-3">
                  <Button onClick={seedFakeJobs} disabled={seedingJobs || deletingAllJobs} variant="outline" className="flex-1 h-12 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {seedingJobs ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Seeding...</> : "Seed 100+ Jobs"}
                  </Button>
                  <Button
                    onClick={async () => {
                      setDeletingAllJobs(true);
                      try {
                        await supabase.from("freelance_interests").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                        await supabase.from("freelance_projects").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                        toast({ title: "All jobs deleted 🗑️" });
                        fetchAll();
                      } catch (e: any) {
                        toast({ title: "Delete failed", description: e.message, variant: "destructive" });
                      }
                      setDeletingAllJobs(false);
                    }}
                    disabled={deletingAllJobs || seedingJobs}
                    variant="outline"
                    className="h-12 rounded-full text-[10px] font-black uppercase tracking-widest text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    {deletingAllJobs ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Deleting...</> : <><Trash2 className="h-3.5 w-3.5 mr-2" />Delete All</>}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest">Active Listings ({freelanceProjects.length})</h3>
                </div>
                <div className="max-h-[600px] overflow-y-auto space-y-3 pr-1">
                  {freelanceProjects.map((p) => (
                    <div key={p.id} className="premium-card p-5 border-border/10 hover:border-accent/20 transition-all">
                      {editingFreelance === p.id ? (
                        <div className="space-y-3">
                          <PremiumInput label="Title" value={editFreelanceForm.title} onChange={(e) => setEditFreelanceForm((f) => ({ ...f, title: e.target.value }))} />
                          <div className="grid grid-cols-2 gap-3">
                            <PremiumInput label="Budget" value={editFreelanceForm.budget} onChange={(e) => setEditFreelanceForm((f) => ({ ...f, budget: e.target.value }))} />
                            <PremiumInput label="City" value={editFreelanceForm.location} onChange={(e) => setEditFreelanceForm((f) => ({ ...f, location: e.target.value }))} />
                          </div>
                          <PremiumTextarea label="Description" value={editFreelanceForm.description} onChange={(e) => setEditFreelanceForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1 btn-gold text-white font-black text-[9px] uppercase tracking-widest rounded-full" onClick={() => updateFreelance(p.id)}>
                              <Check className="h-3 w-3 mr-1" />Save
                            </Button>
                            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setEditingFreelance(null)}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-black text-foreground uppercase tracking-tight flex-1">{p.title}</p>
                            <span className="text-[9px] font-black text-accent bg-accent/5 px-2 py-1 rounded border-t border-accent/10 ml-2">{p.budget}</span>
                          </div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 mb-1">{p.location}</p>
                          <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic mb-3 line-clamp-2">{p.description}</p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="rounded-full text-[9px] font-black uppercase tracking-widest flex-1" onClick={() => { setEditingFreelance(p.id); setEditFreelanceForm({ title: p.title, budget: p.budget, location: p.location, description: p.description || "" }); }}>
                              <Pencil className="h-3 w-3 mr-1.5" />Edit
                            </Button>
                            <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/5" onClick={() => deleteFreelance(p.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {freelanceProjects.length === 0 && (
                    <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-border/10 px-8">
                      <Briefcase className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">No job listings yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Job Inquiries from Students */}
            {jobInquiries.length > 0 && (
              <div className="mt-8 premium-card !p-0 border-border/10 overflow-hidden">
                <div className="p-5 border-b border-border/10 bg-muted/10">
                  <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-accent" />
                    Job Inquiries from Students ({jobInquiries.length})
                  </h3>
                </div>
                <div className="divide-y divide-border/5 max-h-80 overflow-y-auto">
                  {jobInquiries.map((m: any) => {
                    const sender = students.find((s) => s.id === m.sender_id);
                    return (
                      <div key={m.id} className="px-6 py-4 hover:bg-muted/5 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-black text-foreground uppercase tracking-tight">{sender?.full_name || "Unknown"}</span>
                          <span className="text-[9px] font-black text-muted-foreground opacity-40">{new Date(m.created_at).toLocaleDateString("en-GB")} {new Date(m.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="text-[12px] font-medium text-muted-foreground leading-relaxed">{m.content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── MESSAGES ── */}
          <TabsContent value="messages" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PremiumFormWrapper
                title="Global Broadcast"
                subtitle="Transmission to all active operatives"
                icon={<Send className="h-4 w-4 text-accent" />}
              >
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); sendBroadcast(); }}>
                  <PremiumTextarea
                    placeholder="Enter frequency message..."
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    rows={5}
                  />
                  <motion.div variants={itemVariants}>
                    <Button type="submit" className="w-full h-14 rounded-full btn-gold text-white font-black text-xs uppercase tracking-[0.2em] shadow-gold-lg hover:scale-[1.02] transition-all">
                      Initiate Sequence
                    </Button>
                  </motion.div>
                </form>
              </PremiumFormWrapper>

              {/* Direct message */}
              <PremiumFormWrapper
                title="Secure Direct Link"
                subtitle="Targeted communication channel"
                icon={<MessageSquare className="h-4 w-4 text-accent" />}
              >
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); sendDirect(); }}>
                  <PremiumSelect
                    label="Recipient Operative"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                  >
                    <option value="">SELECT RECIPIENT...</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id} className="bg-background">{s.full_name || "UNIDENTIFIED"} | {(s.mode || "N/A").toUpperCase()}</option>
                    ))}
                  </PremiumSelect>
                  <PremiumTextarea
                    placeholder="Enter targeted message..."
                    value={directMsg}
                    onChange={(e) => setDirectMsg(e.target.value)}
                    rows={4}
                  />
                  <motion.div variants={itemVariants}>
                    <Button type="submit" className="w-full h-14 rounded-full btn-gold text-white font-black text-xs uppercase tracking-[0.2em] shadow-gold-lg hover:scale-[1.02] transition-all">
                      Establish Link
                    </Button>
                  </motion.div>
                </form>
              </PremiumFormWrapper>
            </div>

            {/* Recent messages */}
            <div className="mt-8 premium-card !p-0 border-white/5 overflow-hidden">
              <div className="p-5 border-b border-white/5 bg-muted/10">
                <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Recent Transmissions</h3>
              </div>
              <div className="divide-y divide-white/[0.02] max-h-80 overflow-y-auto">
                {messages.slice(0, 20).map((m) => (
                  <div key={m.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-3 mb-2">
                      {m.is_broadcast && <span className="text-[9px] font-black bg-accent/5 text-accent border border-accent/20 px-2 py-0.5 rounded uppercase tracking-widest">Broadcast</span>}
                      <span className="text-[10px] font-black text-muted-foreground opacity-40 uppercase">{new Date(m.created_at).toLocaleDateString("en-GB")}</span>
                      <button
                        onClick={async () => {
                          await supabase.from("messages").delete().eq("id", m.id);
                          setMessages((prev) => prev.filter((msg) => msg.id !== m.id));
                          toast({ title: "Message deleted 🗑️" });
                        }}
                        className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                        title="Delete message"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-[13px] font-medium text-muted-foreground leading-relaxed italic">"{m.content}"</p>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="text-center py-20">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">No transmissions recorded in recent history</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── INTERESTS ── */}
          <TabsContent value="interests" className="mt-0">
            <div className="premium-card !p-0 border-white/5 overflow-hidden">
              <div className="p-5 border-b border-white/5 bg-muted/10">
                <h2 className="text-[11px] font-black text-white uppercase tracking-widest">Acquisition Interests ({interests.length})</h2>
              </div>
              <div className="divide-y divide-white/[0.02]">
                {interests.map((i: any) => (
                  <div key={i.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[13px] font-black text-white tracking-tight uppercase">{i.profiles?.full_name || "UNIDENTIFIED"}</p>
                      <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-1 opacity-70">Project: {i.freelance_projects?.title || "UNKNOWN LEDGER"}</p>
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground opacity-40 uppercase">
                      {new Date(i.created_at).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                ))}
                {interests.length === 0 && (
                  <div className="text-center py-20">
                    <BookOpen className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">No operational interests logged</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── CERTIFICATES ── */}
          <TabsContent value="certificates" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PremiumFormWrapper
                title="Declassify Certificate"
                subtitle="Authorize training completion credentials"
                icon={<Award className="h-4 w-4 text-accent" />}
              >
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); issueCert(); }}>
                  <PremiumSelect
                    label="Recipient Operative"
                    value={certForm.student_id}
                    onChange={(e) => setCertForm((f) => ({ ...f, student_id: e.target.value }))}
                  >
                    <option value="">SELECT STUDENT...</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id} className="bg-background">{s.full_name || "UNIDENTIFIED"} | {(s.mode || "N/A").toUpperCase()}</option>
                    ))}
                  </PremiumSelect>
                  <PremiumInput
                    label="Training Program"
                    placeholder="AUTOCAD PLAN EXECUTION"
                    value={certForm.course_name}
                    onChange={(e) => setCertForm((f) => ({ ...f, course_name: e.target.value }))}
                  />
                  <PremiumInput
                    label="Authorization Date"
                    type="date"
                    value={certForm.issue_date}
                    onChange={(e) => setCertForm((f) => ({ ...f, issue_date: e.target.value }))}
                  />
                  <motion.div variants={itemVariants}>
                    <Button type="submit" className="w-full h-14 rounded-full btn-gold text-white font-black text-xs uppercase tracking-[0.2em] shadow-gold-lg hover:scale-[1.02] transition-all">
                      Issue Credential
                    </Button>
                  </motion.div>
                </form>
              </PremiumFormWrapper>

              {/* Certs list */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-2 px-2">Credential Registry</h3>
                <div className="premium-card !p-0 border-white/5 overflow-hidden">
                  <div className="divide-y divide-white/[0.02] max-h-[500px] overflow-y-auto">
                    {certs.map((c: any) => (
                      <div key={c.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors group">
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-tight">{c.profiles?.full_name || "UNIDENTIFIED"}</p>
                          <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-1 opacity-70">{c.course_name} · {new Date(c.issue_date).toLocaleDateString("en-GB")}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCert(c.id)}
                          className="h-9 w-9 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/5 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {certs.length === 0 && (
                      <div className="text-center py-20">
                        <Award className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Archive empty</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── EMAIL ── */}
          <TabsContent value="email" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="premium-card p-8 border-white/5 space-y-6">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <Mail className="h-4 w-4 text-accent" />Direct Intelligence Outbound
                  </h2>
                  <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-1 opacity-60">Authorize external student liaison</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Parameters</Label>
                    <div className="flex gap-2 flex-wrap">
                      {([
                        { value: "all", label: "ALL OPERATIVES" },
                        { value: "paid", label: "ACTIVE ACCESS" },
                        { value: "specific", label: "TARGETED E-MAIL" },
                      ] as const).map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setEmailTo(opt.value)}
                          className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border-t ${emailTo === opt.value
                            ? "btn-gold text-white shadow-gold border-white/20"
                            : "bg-muted/30 text-muted-foreground border-white/5 hover:text-white"
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {emailTo === "specific" && (
                    <PremiumInput
                      label="Recipient Address"
                      type="email"
                      placeholder="OPERATIVE@AGENCY.COM"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                    />
                  )}

                  <PremiumInput
                    label="Intelligence Subject"
                    type="text"
                    placeholder="MISSION BRIEFING RE: PHASE 2"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />

                  <PremiumTextarea
                    label="Full Briefing"
                    placeholder="Enter detailed intelligence briefing..."
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={8}
                  />

                  <Button
                    onClick={sendEmail}
                    disabled={emailLoading}
                    className="w-full h-14 rounded-full btn-gold text-white font-black text-xs uppercase tracking-[0.2em] shadow-gold-lg hover:scale-[1.02] transition-all"
                  >
                    {emailLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-3" />TRANSMITTING…</> : (
                      <><Send className="h-4 w-4 mr-2" />
                        {emailTo === "all" ? `BROADCAST TO ALL (${students.length})` :
                          emailTo === "paid" ? `BROADCAST TO PAID (${students.filter(s => s.has_paid).length})` :
                            "AUTHORIZE TRANSMISSION"}</>
                    )}
                  </Button>
                </div>
              </div>

              {/* Status board */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-2 px-2">Operational Status</h3>
                <div className="premium-card p-8 border-white/5 space-y-6">
                  <div className="space-y-4 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                      Authorized Origin: <strong className="text-white ml-2">HELLO@ARCHBYSHA.COM</strong>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      Total Network: <strong className="text-white ml-2">{students.length} OPERATIVES</strong>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                      Active Access: <strong className="text-white ml-2">{students.filter(s => s.has_paid).length} VERIFIED</strong>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/[0.02] border-t border-white/5 space-y-3">
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Transmission Guidelines</p>
                    <ul className="space-y-2 text-[11px] font-medium text-muted-foreground opacity-70">
                      <li className="flex gap-2"><span>•</span> <span>Global reach for general announcements</span></li>
                      <li className="flex gap-2"><span>•</span> <span>Tiered messaging for paid-tier updates</span></li>
                      <li className="flex gap-2"><span>•</span> <span>Point-to-point for individual liaison</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── EMAIL DRIP ── */}
          {/* ── EMAIL DRIP ── */}
          <TabsContent value="drip" className="mt-0">
            <div className="space-y-8">
              {/* Header + trigger button */}
              <div className="premium-card p-8 border-white/5">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                      <Zap className="h-4 w-4 text-accent shadow-[0_0_10px_rgba(38,62,50,0.5)]" /> Automated Drip Sequence
                    </h2>
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-1 opacity-60">
                      Autonomous liaison protocol • 30m Cron frequency
                    </p>
                  </div>
                  <Button
                    onClick={triggerDripNow}
                    disabled={dripLoading}
                    className="h-12 px-8 rounded-full btn-gold text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-gold-lg hover:scale-[1.05] transition-all"
                  >
                    {dripLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Zap className="h-3.5 w-3.5 mr-2" />}
                    {dripLoading ? "EXECUTING…" : "MANUAL TRIGGER"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  {[
                    { label: "QUEUE SIZE", value: dripQueue.length, color: "text-blue-500" },
                    { label: "TRANSMITTED", value: dripQueue.filter((q: any) => q.status === "sent").length, color: "text-green-500" },
                    { label: "PENDING", value: dripQueue.filter((q: any) => q.status === "pending").length, color: "text-amber-500" },
                    { label: "INTERRUPTED", value: dripQueue.filter((q: any) => q.status === "failed").length, color: "text-red-500" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <p className="text-[9px] font-black text-muted-foreground tracking-widest uppercase mb-1">{stat.label}</p>
                      <p className={`text-lg font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Templates */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-white uppercase tracking-widest px-2">Operational Templates</h3>
                {dripTemplates.map((t: any) => (
                  <div key={t.id} className="premium-card p-8 border-white/5 group hover:border-accent/10 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1.5 rounded-lg bg-accent/5 text-accent text-[9px] font-black uppercase tracking-widest border border-accent/10">
                          {t.delay_hours === 0 ? "IMMEDIATE" : `T + ${t.delay_hours}H`}
                        </span>
                        <span className="text-[11px] font-black text-white uppercase tracking-widest">{t.step_name}</span>
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                          t.enabled ? "bg-green-500/5 text-green-500 border-green-500/10" : "bg-muted/10 text-muted-foreground border-white/5"
                        )}>
                          {t.enabled ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-[9px] font-black uppercase tracking-widest bg-muted/20 border-white/5 hover:bg-muted/30"
                          onClick={() => toggleDripTemplate(t.id, t.enabled)}
                        >
                          {t.enabled ? <Lock className="h-3 w-3 mr-1.5" /> : <Unlock className="h-3 w-3 mr-1.5" />}
                          {t.enabled ? "DEACTIVATE" : "ACTIVATE"}
                        </Button>
                        {editingDrip === t.id ? (
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground" onClick={() => setEditingDrip(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 px-4 rounded-full btn-gold text-white font-black text-[9px] uppercase tracking-widest"
                              onClick={() => saveDripTemplate(t.id)}
                              disabled={dripLoading}
                            >
                              <Check className="h-3.5 w-3.5 mr-1" />SAVE
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 rounded-full bg-accent/5 border-accent/20 text-accent hover:bg-accent hover:text-white transition-all p-0"
                            onClick={() => {
                              setEditingDrip(t.id);
                              setDripEdit({ subject: t.subject, html: t.html });
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {editingDrip === t.id ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">E-mail Subject Line</Label>
                          <Input
                            value={dripEdit.subject}
                            onChange={(e) => setDripEdit((p) => ({ ...p, subject: e.target.value }))}
                            className="h-12 rounded-xl bg-muted/20 border-t border-white/5 font-medium text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">HTML Structure</Label>
                          <Textarea
                            value={dripEdit.html}
                            onChange={(e) => setDripEdit((p) => ({ ...p, html: e.target.value }))}
                            rows={12}
                            className="rounded-xl bg-muted/20 border-t border-white/5 font-mono text-[11px] resize-y"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-6 p-6 rounded-2xl bg-white/[0.01] border border-white/5 italic">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-accent uppercase tracking-widest opacity-50">Authorized Subject</p>
                          <p className="text-[13px] font-medium text-muted-foreground leading-relaxed">{t.subject}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-accent uppercase tracking-widest opacity-50">Network Saturation</p>
                          <p className="text-[13px] font-medium text-muted-foreground leading-relaxed">
                            {dripQueue.filter((q: any) => q.step_name === t.step_name).length} ACTIVE ENTRIES IN PIPELINE
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

