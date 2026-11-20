"use client";

import { useState, useEffect } from "react";
import { SOCIAL_PLATFORMS } from "@/config/socials";

interface SocialLink {
  label: string;
  href: string;
}

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    tagline: "",
    bio: "",
    email: "",
    url: "http://localhost:3000",
    socials: [
      { label: "GitHub", href: "https://github.com/" },
      { label: "LinkedIn", href: "https://linkedin.com/in/" },
    ] as SocialLink[],
  });

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setFormData({
            name: data.name || "",
            role: data.role || "",
            tagline: data.tagline || "",
            bio: data.bio || "",
            email: data.email || "",
            url: data.url || "http://localhost:3000",
            socials: data.socials && data.socials.length > 0 ? data.socials : [
              { label: "GitHub", href: "https://github.com/" },
              { label: "LinkedIn", href: "https://linkedin.com/in/" },
            ],
          });
        }
        setInitialized(true);
      })
      .catch(() => {
        setInitialized(true);
      });
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setError(null);
  };

  const handleSocialPlatformChange = (index: number, label: string) => {
    const platform = SOCIAL_PLATFORMS.find((p) => p.label === label);
    setFormData((prev) => {
      const newSocials = [...prev.socials];
      newSocials[index] = {
        label,
        href: platform ? platform.defaultUrl : newSocials[index].href,
      };
      return { ...prev, socials: newSocials };
    });
    setSaved(false);
    setError(null);
  };

  const handleSocialHrefChange = (index: number, href: string) => {
    setFormData((prev) => {
      const newSocials = [...prev.socials];
      newSocials[index] = { ...newSocials[index], href };
      return { ...prev, socials: newSocials };
    });
    setSaved(false);
    setError(null);
  };

  const addSocial = () => {
    const defaultPlatform = SOCIAL_PLATFORMS[0];
    setFormData((prev) => ({
      ...prev,
      socials: [...prev.socials, { label: defaultPlatform.label, href: defaultPlatform.defaultUrl }],
    }));
  };

  const removeSocial = (index: number) => {
    if (formData.socials.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      socials: prev.socials.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const socials = formData.socials.filter(
        (s) => s.label.trim() && s.href.trim()
      );

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          tagline: formData.tagline,
          bio: formData.bio,
          email: formData.email,
          url: formData.url,
          socials,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  if (!initialized) {
    return (
      <div className="mx-auto max-w-3xl animate-fade-in">
        <div className="card text-center py-16">
          <svg className="animate-spin mx-auto h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-ink-soft">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink">Site Settings</h1>
        <p className="mt-2 text-ink-soft">
          Customize your portfolio&apos;s name, description, and contact information.
        </p>
      </div>

      {saved && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700 animate-slide-up">
          Settings saved successfully!
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 animate-slide-up">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="card">
          <h2 className="text-lg font-semibold text-ink mb-6 pb-3 border-b border-line/50">
            Basic Information
          </h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="label">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="input"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label htmlFor="role" className="label">
                Role / Title
              </label>
              <input
                id="role"
                type="text"
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="input"
                placeholder="Full-stack developer"
              />
            </div>

            <div>
              <label htmlFor="tagline" className="label">
                Tagline
              </label>
              <input
                id="tagline"
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
                className="input"
                placeholder="I build fast, accessible web products."
              />
            </div>

            <div>
              <label htmlFor="bio" className="label">
                Bio
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                className="input min-h-[100px] resize-y"
                placeholder="Write a short intro here. It appears on the home page hero."
              />
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="url" className="label">
                Site URL
              </label>
              <input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => handleChange("url", e.target.value)}
                className="input"
                placeholder="https://yourdomain.com"
              />
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-ink">Social Links</h2>
            <button
              type="button"
              onClick={addSocial}
              className="btn-secondary text-sm"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Social
            </button>
          </div>

          <div className="space-y-4">
            {formData.socials.map((social, index) => {
              const matchedPlatform = SOCIAL_PLATFORMS.find((p) => p.label === social.label) || SOCIAL_PLATFORMS[0];
              return (
                <div key={index} className="flex gap-3 items-center rounded-xl p-3 border border-line/60 bg-paper/50">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-white border border-line/80 flex items-center justify-center text-ink shadow-sm">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d={matchedPlatform.iconSvg} />
                    </svg>
                  </div>
                  <div className="w-1/3">
                    <label className="label text-xs mb-1">Platform</label>
                    <select
                      value={social.label}
                      onChange={(e) => handleSocialPlatformChange(index, e.target.value)}
                      className="input py-2 text-sm bg-white"
                    >
                      {SOCIAL_PLATFORMS.map((platform) => (
                        <option key={platform.id + platform.label} value={platform.label}>
                          {platform.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="label text-xs mb-1">Profile URL</label>
                    <input
                      type="url"
                      value={social.href}
                      onChange={(e) => handleSocialHrefChange(index, e.target.value)}
                      className="input py-2 text-sm bg-white"
                      placeholder="https://..."
                    />
                  </div>
                  {formData.socials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSocial(index)}
                      className="mt-6 text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      aria-label="Remove social link"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-sm text-ink-faint">
            Select your social platforms with icons and provide your profile URLs.
          </p>
        </section>

        {/* Save Button */}
        <div className="flex gap-3 pt-4 border-t border-line/50">
          <button
            type="submit"
            disabled={loading}
            className="btn w-full sm:w-auto disabled:opacity-60"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
          <a href="/admin" className="btn-ghost w-full sm:w-auto text-center">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
