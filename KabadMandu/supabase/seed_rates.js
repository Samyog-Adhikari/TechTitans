import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join("=").trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const rates = [
  { name: "Copy / Notebooks", rate_per_kg: 15.00, unit: "per_kg", category: "Paper & Cardboard" },
  { name: "A4 / White Paper", rate_per_kg: 12.00, unit: "per_kg", category: "Paper & Cardboard" },
  { name: "Books & Magazines", rate_per_kg: 11.00, unit: "per_kg", category: "Paper & Cardboard" },
  { name: "Cardboard", rate_per_kg: 10.00, unit: "per_kg", category: "Paper & Cardboard" },
  { name: "Carton", rate_per_kg: 10.00, unit: "per_kg", category: "Paper & Cardboard" },
  { name: "Confidential Documents", rate_per_kg: 7.00, unit: "per_kg", category: "Paper & Cardboard" },
  { name: "Magazines", rate_per_kg: 7.00, unit: "per_kg", category: "Paper & Cardboard" },
  { name: "Shredded Paper", rate_per_kg: 5.00, unit: "per_kg", category: "Paper & Cardboard" },
  { name: "Invitation Cards", rate_per_kg: 4.00, unit: "per_kg", category: "Paper & Cardboard" },
  { name: "Egg Crates", rate_per_kg: 1.00, unit: "per_piece", category: "Paper & Cardboard" },
  { name: "Copper", rate_per_kg: 1300.00, unit: "per_kg", category: "Metals" },
  { name: "Brass", rate_per_kg: 1000.00, unit: "per_kg", category: "Metals" },
  { name: "Aluminium", rate_per_kg: 200.00, unit: "per_kg", category: "Metals" },
  { name: "Steel / Iron", rate_per_kg: 42.00, unit: "per_kg", category: "Metals" },
  { name: "Tin & Cans", rate_per_kg: 18.00, unit: "per_kg", category: "Metals" },
  { name: "PET Bottles", rate_per_kg: 20.00, unit: "per_kg", category: "Plastic" },
  { name: "Hard Plastic", rate_per_kg: 15.00, unit: "per_kg", category: "Plastic" },
  { name: "Mixed Plastic", rate_per_kg: 10.00, unit: "per_kg", category: "Plastic" },
  { name: "Computer / CPU", rate_per_kg: 400.00, unit: "per_piece", category: "E-Waste" },
  { name: "Laptop", rate_per_kg: 400.00, unit: "per_kg", category: "E-Waste" },
  { name: "Mobile Phone", rate_per_kg: 100.00, unit: "per_piece", category: "E-Waste" },
  { name: "Television", rate_per_kg: 100.00, unit: "per_piece", category: "E-Waste" },
  { name: "Cables & Chargers", rate_per_kg: 150.00, unit: "per_kg", category: "E-Waste" },
  { name: "Printer / Small Electronics", rate_per_kg: 80.00, unit: "per_piece", category: "E-Waste" },
  { name: "Glass Bottles / Jars", rate_per_kg: 3.00, unit: "per_kg", category: "Glass & Bottles" },
  { name: "Beer Bottle", rate_per_kg: 1.00, unit: "per_piece", category: "Glass & Bottles" },
  { name: "Stainless Steel Utensils", rate_per_kg: 90.00, unit: "per_kg", category: "Household Metal" },
  { name: "Aluminium Utensils", rate_per_kg: 150.00, unit: "per_kg", category: "Household Metal" },
  { name: "Old Clothes / Textile", rate_per_kg: 8.00, unit: "per_kg", category: "Textile" },
  { name: "Mattress", rate_per_kg: 150.00, unit: "per_piece", category: "Household Items" },
  { name: "Wooden Furniture Scrap", rate_per_kg: 5.00, unit: "per_kg", category: "Household Items" },
  { name: "Tyres / Rubber", rate_per_kg: 10.00, unit: "per_kg", category: "Rubber" },
  { name: "Car Battery (Lead-Acid)", rate_per_kg: 180.00, unit: "per_kg", category: "Batteries" },
  { name: "Inverter Battery", rate_per_kg: 170.00, unit: "per_kg", category: "Batteries" },
  { name: "Washing Machine", rate_per_kg: 600.00, unit: "per_piece", category: "Appliances" },
  { name: "Refrigerator", rate_per_kg: 700.00, unit: "per_piece", category: "Appliances" },
  { name: "Air Conditioner", rate_per_kg: 1200.00, unit: "per_piece", category: "Appliances" },
  { name: "Iron Rod / Rebar Scrap", rate_per_kg: 48.00, unit: "per_kg", category: "Metals" },
  { name: "Wire Scrap (Copper-coated)", rate_per_kg: 250.00, unit: "per_kg", category: "Metals" },
  { name: "Gas Cylinder (Empty)", rate_per_kg: 300.00, unit: "per_piece", category: "Household Items" }
];

async function run() {
  console.log("Signing in as admin...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "admin@kabadmandu.com",
    password: "Admin@12345"
  });

  if (authError) {
    console.error("Authentication failed:", authError.message);
    return;
  }

  console.log("Authentication successful! Admin User ID:", authData.user.id);

  // Check columns of waste_types first by retrieving one record
  const { data: existing, error: checkError } = await supabase
    .from("waste_types")
    .select("*")
    .limit(1);

  if (checkError) {
    console.error("Error checking waste_types:", checkError.message);
    return;
  }

  const record = existing[0] || {};
  const hasUnit = "unit" in record;
  const hasCategory = "category" in record;

  if (!hasUnit || !hasCategory) {
    console.warn("⚠️ Warning: Table 'waste_types' is missing 'unit' or 'category' columns.");
    console.warn("Please run the ALTER TABLE SQL command in your Supabase SQL Editor first:");
    console.warn("ALTER TABLE public.waste_types ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'per_kg' NOT NULL CHECK (unit IN ('per_kg', 'per_piece'));");
    console.warn("ALTER TABLE public.waste_types ADD COLUMN IF NOT EXISTS category TEXT;");
    console.log("Attempting to insert rates with formatted names as fallback...");
    
    // Fallback: append unit and category to name
    const fallbackRates = rates.map(r => ({
      name: `${r.name} (${r.unit === "per_piece" ? "per piece" : "per kg"})`,
      rate_per_kg: r.rate_per_kg,
      active: true
    }));

    for (const item of fallbackRates) {
      const { error: insErr } = await supabase
        .from("waste_types")
        .upsert(item, { onConflict: "name" });
      if (insErr) {
        console.error(`Failed to insert fallback ${item.name}:`, insErr.message);
      } else {
        console.log(`Successfully upserted fallback: ${item.name}`);
      }
    }
  } else {
    console.log("Columns 'unit' and 'category' found! Seeding all 40 rates with categories and units...");
    
    for (const item of rates) {
      const { error: insErr } = await supabase
        .from("waste_types")
        .upsert({
          name: item.name,
          rate_per_kg: item.rate_per_kg,
          unit: item.unit,
          category: item.category,
          active: true
        }, { onConflict: "name" });
        
      if (insErr) {
        console.error(`Failed to insert ${item.name}:`, insErr.message);
      } else {
        console.log(`Successfully upserted: ${item.name} (${item.category}, Rs. ${item.rate_per_kg}/${item.unit})`);
      }
    }
  }
}

run();
