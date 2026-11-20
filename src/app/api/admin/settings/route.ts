import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { name, role, tagline, bio, email, socials, url } = body;

    // Validate required fields
    if (!name || !role || !tagline || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get existing settings
    const { data: existing } = await supabase
      .from("site_settings")
      .select("*")
      .single();

    if (existing) {
      const { error } = await supabase
        .from("site_settings")
        .update({
          name,
          role,
          tagline,
          bio,
          email,
          socials: socials || [],
          url: url || existing.url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from("site_settings").insert({
        name,
        role,
        tagline,
        bio,
        email,
        socials: socials || [],
        url: url || "http://localhost:3000",
      });

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save settings" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("*").single();

    if (!data) {
      return NextResponse.json({
        name: "Your Name",
        role: "Full-stack developer",
        tagline: "I build fast, accessible web products.",
        bio: "Write a short intro here. It appears on the home page hero.",
        email: "you@example.com",
        socials: [
          { label: "GitHub", href: "https://github.com/your-handle" },
          { label: "LinkedIn", href: "https://linkedin.com/in/your-handle" },
        ],
        url: "http://localhost:3000",
      });
    }

    return NextResponse.json({
      ...data,
      socials: data.socials || [],
    });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}