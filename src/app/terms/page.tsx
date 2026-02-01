'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Clock, CreditCard, Plane, Baby, AlertTriangle, Home, Phone, Mail } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to E&apos;Nauwi Beach Resort
          </Link>
          <h1 className="text-4xl font-bold mb-4">Terms, Conditions &amp; Privacy Policy</h1>
          <p className="text-blue-100 text-lg">E&apos;Nauwi Beach Resort — Malekula Island, Vanuatu</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Check-in / Check-out */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-blue-100 rounded-lg"><Clock className="h-5 w-5 text-blue-600" /></div>
            <h2 className="text-xl font-bold text-gray-900">Check-In &amp; Check-Out</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Check-In</p>
              <p className="text-2xl font-bold text-blue-900">2:00 PM</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Check-Out</p>
              <p className="text-2xl font-bold text-blue-900">10:00 AM</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li>• Late check-out: <strong>VUV 2,500 per hour</strong> (subject to availability)</li>
            <li>• The front desk is open daily from <strong>8:00 AM – 5:00 PM</strong></li>
            <li>• Guests will receive an email 7 days before arrival with check-in instructions</li>
            <li>• If arriving after 5:00 PM, please contact the property in advance</li>
          </ul>
        </section>

        {/* Cancellation Policy */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-amber-100 rounded-lg"><AlertTriangle className="h-5 w-5 text-amber-600" /></div>
            <h2 className="text-xl font-bold text-gray-900">Cancellation Policy</h2>
          </div>
          <p className="text-gray-600 mb-4">Free cancellations 14 days prior to check-in. As we are a small business, late cancellations and no-shows really affect our business.</p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-green-600 font-bold text-lg mt-0.5">✓</span>
              <div>
                <p className="font-semibold text-gray-900">14+ days prior to check-in</p>
                <p className="text-sm text-gray-600">No cancellation fees apply. Full refund of total amount.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-amber-600 font-bold text-lg mt-0.5">!</span>
              <div>
                <p className="font-semibold text-gray-900">Within 14 days of arrival</p>
                <p className="text-sm text-gray-600">50% refund of the total amount shall be granted.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <span className="text-red-600 font-bold text-lg mt-0.5">✗</span>
              <div>
                <p className="font-semibold text-gray-900">Within 7 days / No-shows</p>
                <p className="text-sm text-gray-600">100% charge of the booking will apply.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <span className="text-red-600 font-bold text-lg mt-0.5">✗</span>
              <div>
                <p className="font-semibold text-gray-900">Within 24 hours of check-in</p>
                <p className="text-sm text-gray-600">Full payment of the reservation will be charged.</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">There may be additional applicable charges and taxes.</p>
        </section>

        {/* Airport Transfer */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-blue-100 rounded-lg"><Plane className="h-5 w-5 text-blue-600" /></div>
            <h2 className="text-xl font-bold text-gray-900">Airport Transfer</h2>
          </div>
          <p className="text-gray-600 mb-4">This property offers transfers from the airport (surcharges apply).</p>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Adults</p>
              <p className="text-xl font-bold text-blue-900">VUV 2,000 <span className="text-sm font-normal text-gray-500">per person, one-way</span></p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Children (2–12 years)</p>
              <p className="text-xl font-bold text-blue-900">VUV 1,000 <span className="text-sm font-normal text-gray-500">per child, one-way</span></p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 font-medium">⚠️ Important</p>
            <p className="text-sm text-amber-700">To arrange pick-up, guests must contact the property <strong>72 hours prior to arrival</strong>.</p>
          </div>
        </section>

        {/* Children Policy */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-purple-100 rounded-lg"><Baby className="h-5 w-5 text-purple-600" /></div>
            <h2 className="text-xl font-bold text-gray-900">Children Policy</h2>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 mb-4">
            <p className="text-purple-900 font-semibold text-lg">Kids stay FREE! 🎉</p>
            <p className="text-purple-700 text-sm mt-1">Up to 2 children 12 years old and younger stay free when occupying the parent or guardian&apos;s room, using existing bedding.</p>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Nanny Service available daily <strong>8:00 AM – 8:00 PM</strong></li>
            <li>• Kids trampoline and jumping castle on property</li>
            <li>• Roll-away beds available upon request (subject to availability)</li>
          </ul>
        </section>

        {/* Fees & Charges */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-green-100 rounded-lg"><CreditCard className="h-5 w-5 text-green-600" /></div>
            <h2 className="text-xl font-bold text-gray-900">Fees &amp; Charges</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 text-gray-600">Tourism Levy</td>
                  <td className="py-3 text-right font-semibold text-gray-900">VUV 200 per room per day</td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-600">Credit card surcharge</td>
                  <td className="py-3 text-right font-semibold text-gray-900">4%</td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-600">Late check-out</td>
                  <td className="py-3 text-right font-semibold text-gray-900">VUV 2,500 per hour</td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-600">Extra adult (roll-away bed)</td>
                  <td className="py-3 text-right font-semibold text-gray-900">Applicable rate per night</td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-600">Extra child (roll-away bed)</td>
                  <td className="py-3 text-right font-semibold text-gray-900">Applicable rate per night</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-4">Tourism levy charged at check-out. Cash and credit cards accepted. Extra-person charges may vary depending on property policy.</p>
        </section>

        {/* General Terms */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-gray-100 rounded-lg"><Shield className="h-5 w-5 text-gray-600" /></div>
            <h2 className="text-xl font-bold text-gray-900">General Terms &amp; Conditions</h2>
          </div>
          <ul className="space-y-3 text-sm text-gray-700">
            <li>• Government-issued photo identification and a credit card or cash deposit may be required at check-in for incidental charges.</li>
            <li>• Special requests are subject to availability upon check-in and may incur additional charges; special requests cannot be guaranteed.</li>
            <li>• The name on the credit card used at check-in to pay for incidentals must be the primary name on the guestroom reservation.</li>
            <li>• This property accepts credit cards and cash.</li>
            <li>• Safety features at this property include a fire extinguisher.</li>
            <li>• Only registered guests are allowed in the guestrooms.</li>
            <li>• Bed types are requests only and may not be honoured if availability does not permit.</li>
            <li>• Cultural norms and guest policies may differ by country and by property.</li>
          </ul>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-blue-100 rounded-lg"><Home className="h-5 w-5 text-blue-600" /></div>
            <h2 className="text-xl font-bold text-gray-900">Contact Us</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <a href="tel:+67822170" className="text-blue-600 font-medium hover:underline">+678 22170</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">General Manager</p>
                <a href="mailto:gm@enauwibeachresort.com" className="text-blue-600 font-medium hover:underline">gm@enauwibeachresort.com</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Marketing</p>
                <a href="mailto:marketing@enauwibeachresort.com" className="text-blue-600 font-medium hover:underline">marketing@enauwibeachresort.com</a>
              </div>
            </div>
          </div>
        </section>

        {/* Back links */}
        <div className="text-center space-x-6 pt-4 pb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
            ← Back to Website
          </Link>
          <Link href="/book" className="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
            Book Your Stay →
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 pb-8">
          Source: marketing@enauwibeachresort.com — Last updated: February 2026
        </p>
      </div>
    </div>
  )
}
