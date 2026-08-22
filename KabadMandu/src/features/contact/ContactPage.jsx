import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MessageCircle, Mail, MapPin, Phone, CheckCircle2 } from "lucide-react"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col gap-16 py-12 px-6 sm:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          GET IN TOUCH
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          We're Here to Help You Recycle & Earn
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Have questions about scrap rates, booking bulk pickups, or registering as a collector? Reach out directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 dark:border-border p-6 bg-white dark:bg-card shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Direct Contact
            </h3>
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">WhatsApp Support</p>
                  <a href="https://wa.me/9779801234567" target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                    +977 9801234567
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Email</p>
                  <a href="mailto:hello@kabadmandu.com" className="text-emerald-600 hover:underline">
                    hello@kabadmandu.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Office Location</p>
                  <p className="text-slate-500">Kupondole, Lalitpur, Bagmati Province, Nepal</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-emerald-300/60 dark:border-emerald-900 p-6 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm">
            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 mb-2">
              Operating Hours
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Pickups & Customer Care: <strong>7:00 AM – 7:00 PM</strong>, all 7 days across Kathmandu, Lalitpur, and Bhaktapur.
            </p>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-slate-200/80 dark:border-border p-8 bg-white dark:bg-card shadow-sm">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="text-xl">Send us an inquiry</CardTitle>
              <CardDescription>
                Fill out the form below and a representative will reply within 2 hours.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              {submitted ? (
                <div className="flex flex-col items-center text-center p-8 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-3" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Message Received!</h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-sm">
                    Thank you for contacting KabadMandu. Our support coordinator will get back to you shortly.
                  </p>
                  <Button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", message: "" }) }}
                    variant="outline"
                    size="sm"
                    className="mt-5 rounded-full"
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs">Your Name</Label>
                      <Input
                        id="name"
                        required
                        placeholder="e.g. Ramesh Thapa"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                      <Input
                        id="phone"
                        required
                        placeholder="e.g. 9841234567"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="e.g. ramesh@gmail.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-xs">Your Message or Pickup Details</Label>
                    <textarea
                      id="message"
                      rows={4}
                      required
                      placeholder="Describe what kind of scrap or bulk pickup you need..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full rounded-lg border border-input bg-transparent p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>

                  <Button type="submit" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 font-semibold">
                    Submit Inquiry
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
