'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Clock, CreditCard, Plane, Baby, AlertTriangle, Home, Phone, Mail, Ban } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-sand">
      {/* Header */}
      <div className="bg-ocean-dark text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-ocean-100 hover:text-white mb-6 text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to E&apos;Nauwi Beach Resort
          </Link>
          <h1 className="font-serif text-4xl font-bold mb-4">Terms, Conditions &amp; Policies</h1>
          <p className="text-ocean-100 text-lg">E&apos;Nauwi Beach Resort — Malekula Island, Vanuatu</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Check-in / Check-out */}
        <section className="bg-white rounded-2xl shadow-sm border border-ocean/5 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-ocean/10 rounded-xl"><Clock className="h-5 w-5 text-ocean" /></div>
            <h2 className="font-serif text-xl font-bold text-ocean">Check-In &amp; Check-Out</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-ocean/5 rounded-xl p-4">
              <p className="text-sm text-ocean/70 font-medium">Check-In</p>
              <p className="text-2xl font-bold text-ocean">2:00 PM</p>
            </div>
            <div className="bg-ocean/5 rounded-xl p-4">
              <p className="text-sm text-ocean/70 font-medium">Check-Out</p>
              <p className="text-2xl font-bold text-ocean">10:00 AM</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-ocean/70">
            <li>• Late check-out: <strong className="text-ocean">VUV 2,500 per hour</strong> (subject to availability)</li>
            <li>• The front desk is open daily from <strong className="text-ocean">8:00 AM – 5:00 PM</strong></li>
            <li>• An email with check-in instructions is sent <strong className="text-ocean">7 days before arrival</strong></li>
            <li>• If arriving after 5:00 PM, please <strong className="text-ocean">contact the property in advance</strong></li>
          </ul>
        </section>

        {/* Cancellation Policy */}
        <section className="bg-white rounded-2xl shadow-sm border border-ocean/5 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-gold/10 rounded-xl"><AlertTriangle className="h-5 w-5 text-gold-dark" /></div>
            <h2 className="font-serif text-xl font-bold text-ocean">Cancellation Policy</h2>
          </div>
          <p className="text-ocean/60 mb-4">Free cancellations 14+ days prior to check-in. As we are a small business, late cancellations and no-shows really affect our business.</p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-light/10 rounded-xl border border-green-light/20">
              <span className="text-green font-bold text-lg mt-0.5">✓</span>
              <div>
                <p className="font-semibold text-ocean">14+ days prior to check-in</p>
                <p className="text-sm text-ocean/60">Free cancellation — full refund of total amount.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gold/10 rounded-xl border border-gold/20">
              <span className="text-gold-dark font-bold text-lg mt-0.5">!</span>
              <div>
                <p className="font-semibold text-ocean">Within 14 days of arrival</p>
                <p className="text-sm text-ocean/60">50% refund of the total amount shall be granted.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
              <span className="text-red-600 font-bold text-lg mt-0.5">✗</span>
              <div>
                <p className="font-semibold text-ocean">Within 7 days / No-shows</p>
                <p className="text-sm text-ocean/60">100% charge of the booking will apply.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
              <span className="text-red-600 font-bold text-lg mt-0.5">✗</span>
              <div>
                <p className="font-semibold text-ocean">Within 24 hours of check-in</p>
                <p className="text-sm text-ocean/60">Full payment of the reservation will be charged.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-ocean/5 rounded-xl border border-ocean/10">
              <Ban className="h-5 w-5 text-ocean/50 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-ocean">Non-refundable rates</p>
                <p className="text-sm text-ocean/60">No cancellation possible — 100% of the booking will be charged.</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-ocean/40 mt-4">There may be additional applicable charges and taxes.</p>
        </section>

        {/* Airport Transfer */}
        <section className="bg-white rounded-2xl shadow-sm border border-ocean/5 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-ocean/10 rounded-xl"><Plane className="h-5 w-5 text-ocean" /></div>
            <h2 className="font-serif text-xl font-bold text-ocean">Airport Transfer</h2>
          </div>
          <p className="text-ocean/60 mb-4">This property offers shuttle transfers from the airport (surcharges apply).</p>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-ocean/5 rounded-xl p-4">
              <p className="text-sm text-ocean/70 font-medium">Adults</p>
              <p className="text-xl font-bold text-ocean">VUV 2,000 <span className="text-sm font-normal text-ocean/50">per person, one-way</span></p>
            </div>
            <div className="bg-ocean/5 rounded-xl p-4">
              <p className="text-sm text-ocean/70 font-medium">Children (≤12 years)</p>
              <p className="text-xl font-bold text-ocean">VUV 1,000 <span className="text-sm font-normal text-ocean/50">per child, one-way</span></p>
            </div>
          </div>
          <div className="bg-gold/10 border border-gold/20 rounded-xl p-4">
            <p className="text-sm text-gold-dark font-medium">⚠️ Important</p>
            <p className="text-sm text-ocean/70">To arrange pick-up, guests must contact the property <strong className="text-ocean">72 hours prior to arrival</strong>.</p>
          </div>
        </section>

        {/* Children Policy */}
        <section className="bg-white rounded-2xl shadow-sm border border-ocean/5 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-gold/10 rounded-xl"><Baby className="h-5 w-5 text-gold-dark" /></div>
            <h2 className="font-serif text-xl font-bold text-ocean">Children Policy</h2>
          </div>
          <div className="bg-green-light/10 rounded-xl p-4 mb-4 border border-green-light/20">
            <p className="text-ocean font-semibold text-lg">Kids stay FREE! 🎉</p>
            <p className="text-ocean/60 text-sm mt-1">Up to 2 children aged 12 and under stay free when occupying the parent or guardian&apos;s room, using existing bedding.</p>
          </div>
          <ul className="space-y-2 text-sm text-ocean/70">
            <li>• Nanny Service available daily <strong className="text-ocean">8:00 AM – 8:00 PM</strong></li>
            <li>• Kids trampoline and jumping castle on property</li>
            <li>• Kids Club available</li>
            <li>• Roll-away beds available upon request (subject to availability)</li>
            <li>• Extra adults: extra adult rate per night</li>
            <li>• Extra children: extra child rate per night</li>
          </ul>
        </section>

        {/* Fees & Charges */}
        <section className="bg-white rounded-2xl shadow-sm border border-ocean/5 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-green/10 rounded-xl"><CreditCard className="h-5 w-5 text-green" /></div>
            <h2 className="font-serif text-xl font-bold text-ocean">Fees &amp; Charges</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-ocean/10">
                <tr>
                  <td className="py-3 text-ocean/60">Tourism Levy</td>
                  <td className="py-3 text-right font-semibold text-ocean">VUV 200 per room per day <span className="font-normal text-ocean/50">(charged at checkout)</span></td>
                </tr>
                <tr>
                  <td className="py-3 text-ocean/60">Credit card surcharge</td>
                  <td className="py-3 text-right font-semibold text-ocean">4%</td>
                </tr>
                <tr>
                  <td className="py-3 text-ocean/60">Late check-out</td>
                  <td className="py-3 text-right font-semibold text-ocean">VUV 2,500 per hour <span className="font-normal text-ocean/50">(subject to availability)</span></td>
                </tr>
                <tr>
                  <td className="py-3 text-ocean/60">Extra adult (roll-away bed)</td>
                  <td className="py-3 text-right font-semibold text-ocean">Extra adult rate per night</td>
                </tr>
                <tr>
                  <td className="py-3 text-ocean/60">Extra child (roll-away bed)</td>
                  <td className="py-3 text-right font-semibold text-ocean">Extra child rate per night</td>
                </tr>
                <tr>
                  <td className="py-3 text-ocean/60">Guest Laundry</td>
                  <td className="py-3 text-right font-semibold text-ocean">Charges apply</td>
                </tr>
                <tr>
                  <td className="py-3 text-ocean/60">Room Service</td>
                  <td className="py-3 text-right font-semibold text-ocean">Charges apply</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-ocean/40 mt-4">The resort accepts both credit cards and cash. Extra-person charges may vary depending on property policy.</p>
        </section>

        {/* General Terms */}
        <section className="bg-white rounded-2xl shadow-sm border border-ocean/5 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-ocean/10 rounded-xl"><Shield className="h-5 w-5 text-ocean" /></div>
            <h2 className="font-serif text-xl font-bold text-ocean">General Terms &amp; Conditions</h2>
          </div>
          <ul className="space-y-3 text-sm text-ocean/70">
            <li>• Extra-person charges may apply.</li>
            <li>• Government-issued photo identification and a credit card or cash deposit are <strong className="text-ocean">required at check-in</strong> for incidental charges.</li>
            <li>• Special requests are subject to availability upon check-in and may incur additional charges; special requests cannot be guaranteed.</li>
            <li>• The name on the credit card used at check-in must be the <strong className="text-ocean">primary name on the guestroom reservation</strong>.</li>
            <li>• This property accepts <strong className="text-ocean">credit cards and cash</strong>.</li>
            <li>• Safety features at this property include a <strong className="text-ocean">fire extinguisher</strong>.</li>
            <li>• Airport transfer: contact the property <strong className="text-ocean">72 hours prior</strong> to arrange pick-up.</li>
            <li>• Front desk hours: <strong className="text-ocean">8:00 AM – 5:00 PM</strong> daily.</li>
            <li>• If arriving after 5:00 PM, please contact the property in advance.</li>
            <li>• An email with check-in instructions will be sent <strong className="text-ocean">7 days before arrival</strong>.</li>
            <li>• Up to 2 children (aged 12 and under) stay <strong className="text-ocean">free</strong> in the parent&apos;s room with existing bedding.</li>
            <li>• Only <strong className="text-ocean">registered guests</strong> are allowed in the guestrooms.</li>
            <li>• Airport shuttle: <strong className="text-ocean">VUV 2,000/adult</strong>, <strong className="text-ocean">VUV 1,000/child</strong> (one-way).</li>
            <li>• Late checkout: <strong className="text-ocean">VUV 2,500/hour</strong> (subject to availability).</li>
            <li>• Roll-away beds: available on request.</li>
            <li>• Credit card surcharge: <strong className="text-ocean">4%</strong>.</li>
            <li>• Tourism Levy: <strong className="text-ocean">VUV 200/room/day</strong> (charged at checkout).</li>
            <li>• Bed type requests are not guaranteed and depend on availability.</li>
          </ul>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-2xl shadow-sm border border-ocean/5 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-ocean/10 rounded-xl"><Home className="h-5 w-5 text-ocean" /></div>
            <h2 className="font-serif text-xl font-bold text-ocean">Contact Us</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-ocean/40" />
              <div>
                <p className="text-sm text-ocean/50">Phone</p>
                <a href="tel:+67822170" className="text-ocean font-medium hover:text-gold transition-colors">+678 22170</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-ocean/40" />
              <div>
                <p className="text-sm text-ocean/50">General Manager</p>
                <a href="mailto:gm@enauwibeachresort.com" className="text-ocean font-medium hover:text-gold transition-colors">gm@enauwibeachresort.com</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-ocean/40" />
              <div>
                <p className="text-sm text-ocean/50">Marketing</p>
                <a href="mailto:marketing@enauwibeachresort.com" className="text-ocean font-medium hover:text-gold transition-colors">marketing@enauwibeachresort.com</a>
              </div>
            </div>
          </div>
        </section>

        {/* Back links */}
        <div className="text-center space-x-6 pt-4 pb-8">
          <Link href="/" className="text-ocean hover:text-ocean-light text-sm font-medium underline transition-colors">
            ← Back to Website
          </Link>
          <Link href="/book" className="text-ocean hover:text-ocean-light text-sm font-medium underline transition-colors">
            Book Your Stay →
          </Link>
        </div>

        <p className="text-center text-xs text-ocean/30 pb-8">
          Source: marketing@enauwibeachresort.com — Last updated: February 2026
        </p>
      </div>
    </div>
  )
}
