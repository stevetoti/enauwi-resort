import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Shield, FileText, CreditCard, Plane, Baby, Clock, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: "Terms, Conditions & Privacy Policy | E'Nauwi Beach Resort",
  description: "Full terms, conditions, cancellation policy, and privacy policy for E'Nauwi Beach Resort, Malekula Island, Vanuatu.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-4">Terms, Conditions & Privacy Policy</h1>
          <p className="text-blue-100 text-lg">E&apos;Nauwi Beach Resort — South West Bay, Malekula Island, Vanuatu</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        {/* Check-in / Check-out */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Check-in & Check-out</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium mb-1">Check-in Time</p>
              <p className="text-2xl font-bold text-blue-900">2:00 PM</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium mb-1">Check-out Time</p>
              <p className="text-2xl font-bold text-blue-900">10:00 AM</p>
            </div>
          </div>
          <p className="text-gray-600 mt-4 text-sm">
            Late check-out is available at <strong>VUV 2,500 per hour</strong>, subject to availability.
          </p>
        </section>

        {/* Cancellation Policy */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900">Cancellation Policy</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Free cancellations are available 14 days prior to check-in. As we are a small business, late cancellations and no-shows really affect our operations.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">14+ days prior to check-in</p>
                <p className="text-gray-600 text-sm">No cancellation fees apply. A full refund of the total amount shall be granted.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <span className="text-amber-600 font-bold">!</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Within 14 days of arrival</p>
                <p className="text-gray-600 text-sm">A 50% refund of the total amount shall be granted.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="text-red-600 font-bold">✗</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">No-shows & cancellations within 7 days</p>
                <p className="text-gray-600 text-sm">Will incur 100% charge of the booking.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="text-red-600 font-bold">✗</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Within 24 hours of check-in</p>
                <p className="text-gray-600 text-sm">Will incur full payment of the reservation.</p>
              </div>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            There may be additional applicable charges and taxes.
          </p>
        </section>

        {/* Fees & Charges */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Fees & Charges</h2>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">Tourism Levy</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">VUV 200 per room per day</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">Credit card surcharge</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">4%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">Late check-out</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">VUV 2,500 per hour</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">Roll-away bed (adult)</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">Extra adult rate per night</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">Roll-away bed (child)</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">Extra child rate per night</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Tourism Levy is charged at check-out. This property accepts credit cards and cash.
          </p>
        </section>

        {/* Airport Transfer */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <Plane className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Airport Transfer</h2>
          </div>
          <p className="text-gray-600 mb-4">
            This property offers transfers from the airport. Surcharges apply as follows:
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium mb-1">Adults (one-way)</p>
              <p className="text-2xl font-bold text-blue-900">VUV 2,000</p>
              <p className="text-xs text-blue-600">per person</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium mb-1">Children 2–12 years (one-way)</p>
              <p className="text-2xl font-bold text-blue-900">VUV 1,000</p>
              <p className="text-xs text-blue-600">per person</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 font-semibold text-sm">⚠️ Important</p>
            <p className="text-amber-700 text-sm mt-1">
              To arrange pick-up, guests must contact the property <strong>72 hours prior to arrival</strong>.
              Guests will receive an email 7 days before arrival with check-in instructions.
              If arriving after 5:00 PM, please contact the property in advance.
            </p>
          </div>
        </section>

        {/* Children Policy */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <Baby className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Children Policy</h2>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              Up to <strong>2 children aged 12 years and younger</strong> stay free when occupying the parent or guardian&apos;s room, using existing bedding.
            </p>
          </div>
          <p className="text-gray-600 text-sm mt-4">
            Extra-person charges may apply and vary depending on property policy. Roll-away beds are available upon request, subject to availability.
          </p>
        </section>

        {/* Terms & Conditions */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Terms & Conditions</h2>
          </div>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Extra-person charges may apply and vary depending on property policy.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Government-issued photo identification and a credit card or cash deposit may be required at check-in for incidental charges.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Special requests are subject to availability upon check-in and may incur additional charges; special requests cannot be guaranteed.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>The name on the credit card used at check-in to pay for incidentals must be the primary name on the guestroom reservation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>This property accepts credit cards and cash.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Safety features at this property include a fire extinguisher.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Only registered guests are allowed in the guestrooms.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Bed types are requests only and may not be honoured if availability does not permit.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Cultural norms and guest policies may differ by country and by property.</span>
            </li>
          </ul>
        </section>

        {/* Privacy Policy */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
          </div>
          <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
            <p>
              E&apos;Nauwi Beach Resort is committed to protecting your privacy. We collect personal information (name, email, phone number, payment details) solely for the purpose of processing bookings and providing our services.
            </p>
            <p>
              <strong>Information We Collect:</strong> When you make a reservation, we collect your name, contact details, payment information, and any special requests. We may also collect information through our website chat and contact forms.
            </p>
            <p>
              <strong>How We Use Your Information:</strong> Your information is used to process and manage your booking, communicate check-in instructions and resort information, respond to your inquiries, and improve our services.
            </p>
            <p>
              <strong>Data Sharing:</strong> We do not sell or share your personal information with third parties, except as required to process your booking (e.g., payment processors) or as required by law.
            </p>
            <p>
              <strong>Data Security:</strong> We implement reasonable security measures to protect your personal information. However, no method of electronic transmission or storage is 100% secure.
            </p>
            <p>
              <strong>Contact Us:</strong> For any privacy-related questions or to request deletion of your data, please contact us at{' '}
              <a href="mailto:gm@enauwibeachresort.com" className="text-blue-600 hover:text-blue-800 underline">
                gm@enauwibeachresort.com
              </a>.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-bold text-blue-900 mb-2">Have Questions?</h2>
          <p className="text-blue-700 mb-4">
            Contact us for any questions about our policies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:gm@enauwibeachresort.com"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Email Us
            </a>
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium border border-blue-200 transition-colors"
            >
              Book a Room
            </Link>
          </div>
          <p className="text-blue-600 text-sm mt-4">
            Front desk: 8:00 AM – 5:00 PM daily &nbsp;|&nbsp; Phone: +678 22170
          </p>
        </section>

      </div>
    </div>
  )
}
