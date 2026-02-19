import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const ADMIN_EMAILS = ['reservation@enauwibeachresort.com', 'gm@enauwibeachresort.com', 'marketing@enauwibeachresort.com', 'toti@pacificwavedigital.com', 'steve@pacificwavedigital.com']
const FROM_NOREPLY = 'E\'Nauwi Beach Resort <noreply@totiroom.pacificwavedigital.com>'
const FROM_CONCIERGE = 'E\'Nauwi Concierge <concierge@totiroom.pacificwavedigital.com>'

// ─── Email Templates ─────────────────────────────────────────────
function bookingConfirmationHTML(data: {
  guestName: string
  roomName: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: string
  reference: string
  specialRequests?: string
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0A4B78,#0D5A91);padding:40px 30px;text-align:center;">
    <h1 style="color:#D4A853;font-size:28px;margin:0;font-family:Georgia,serif;">E'Nauwi Beach Resort</h1>
    <p style="color:#ffffff;opacity:0.8;margin:8px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Booking Confirmation</p>
  </div>
  
  <!-- Body -->
  <div style="padding:30px;">
    <h2 style="color:#0A4B78;font-size:22px;margin:0 0 8px;">Welkam, ${data.guestName}!</h2>
    <p style="color:#666;line-height:1.6;margin:0 0 24px;">Your reservation request has been received. Our team will confirm your booking within 24 hours.</p>
    
    <!-- Booking Details Card -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:24px;">
      <h3 style="color:#0A4B78;font-size:16px;margin:0 0 16px;border-bottom:2px solid #D4A853;padding-bottom:8px;">Booking Details</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#888;font-size:14px;">Reference</td><td style="padding:8px 0;color:#0A4B78;font-weight:bold;text-align:right;font-size:14px;">${data.reference}</td></tr>
        <tr><td style="padding:8px 0;color:#888;font-size:14px;">Room</td><td style="padding:8px 0;color:#333;text-align:right;font-size:14px;">${data.roomName}</td></tr>
        <tr><td style="padding:8px 0;color:#888;font-size:14px;">Check-in</td><td style="padding:8px 0;color:#333;text-align:right;font-size:14px;">${data.checkIn}</td></tr>
        <tr><td style="padding:8px 0;color:#888;font-size:14px;">Check-out</td><td style="padding:8px 0;color:#333;text-align:right;font-size:14px;">${data.checkOut}</td></tr>
        <tr><td style="padding:8px 0;color:#888;font-size:14px;">Guests</td><td style="padding:8px 0;color:#333;text-align:right;font-size:14px;">${data.guests}</td></tr>
        ${data.specialRequests ? `<tr><td style="padding:8px 0;color:#888;font-size:14px;">Special Requests</td><td style="padding:8px 0;color:#333;text-align:right;font-size:14px;">${data.specialRequests}</td></tr>` : ''}
        <tr style="border-top:2px solid #D4A853;"><td style="padding:12px 0;color:#0A4B78;font-weight:bold;font-size:16px;">Total</td><td style="padding:12px 0;color:#0A4B78;font-weight:bold;text-align:right;font-size:16px;">${data.totalPrice}</td></tr>
      </table>
    </div>
    
    <p style="color:#666;line-height:1.6;font-size:14px;">📞 Questions? Call us at <strong>+678 22170</strong> or reply to this email.</p>
    <p style="color:#666;line-height:1.6;font-size:14px;">We look forward to welcoming you to paradise!</p>
    <p style="color:#D4A853;font-family:Georgia,serif;font-size:16px;margin-top:24px;">— The E'Nauwi Team</p>
  </div>
  
  <!-- Footer -->
  <div style="background:#083D63;padding:24px 30px;text-align:center;">
    <p style="color:#ffffff;opacity:0.6;font-size:12px;margin:0;">E'Nauwi Beach Resort · South East Efate, Vanuatu</p>
    <p style="color:#ffffff;opacity:0.6;font-size:12px;margin:4px 0 0;">📞 +678 22170 · ✉ info@enauwiresort.vu</p>
  </div>
</div>
</body>
</html>`
}

function contactFormAdminHTML(data: {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;">
  <div style="background:linear-gradient(135deg,#0A4B78,#0D5A91);padding:30px;text-align:center;">
    <h1 style="color:#D4A853;font-size:24px;margin:0;font-family:Georgia,serif;">New Contact Form Submission</h1>
  </div>
  <div style="padding:30px;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#888;font-size:14px;width:100px;vertical-align:top;">Name</td><td style="padding:8px 0;color:#333;font-size:14px;font-weight:bold;">${data.name}</td></tr>
        <tr><td style="padding:8px 0;color:#888;font-size:14px;vertical-align:top;">Email</td><td style="padding:8px 0;color:#333;font-size:14px;"><a href="mailto:${data.email}" style="color:#0A4B78;">${data.email}</a></td></tr>
        ${data.phone ? `<tr><td style="padding:8px 0;color:#888;font-size:14px;vertical-align:top;">Phone</td><td style="padding:8px 0;color:#333;font-size:14px;">${data.phone}</td></tr>` : ''}
        <tr><td style="padding:8px 0;color:#888;font-size:14px;vertical-align:top;">Subject</td><td style="padding:8px 0;color:#0A4B78;font-size:14px;font-weight:bold;">${data.subject}</td></tr>
        <tr><td style="padding:8px 0;color:#888;font-size:14px;vertical-align:top;">Message</td><td style="padding:8px 0;color:#333;font-size:14px;line-height:1.6;">${data.message.replace(/\n/g, '<br>')}</td></tr>
      </table>
    </div>
    <p style="color:#888;font-size:12px;margin-top:16px;">Sent from the E'Nauwi Beach Resort website contact form.</p>
  </div>
</div>
</body>
</html>`
}

function contactAutoReplyHTML(name: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;">
  <div style="background:linear-gradient(135deg,#0A4B78,#0D5A91);padding:40px 30px;text-align:center;">
    <h1 style="color:#D4A853;font-size:28px;margin:0;font-family:Georgia,serif;">E'Nauwi Beach Resort</h1>
    <p style="color:#ffffff;opacity:0.8;margin:8px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Message Received</p>
  </div>
  <div style="padding:30px;">
    <h2 style="color:#0A4B78;font-size:22px;margin:0 0 8px;">Tankiu Tumas, ${name}!</h2>
    <p style="color:#666;line-height:1.6;">Thank you for reaching out to E'Nauwi Beach Resort. We have received your message and our team will get back to you within 24 hours.</p>
    <p style="color:#666;line-height:1.6;">In the meantime, feel free to:</p>
    <ul style="color:#666;line-height:1.8;">
      <li>📞 Call us at <strong>+678 22170</strong></li>
      <li>🌐 Chat with our AI concierge on our website</li>
      <li>📍 Visit us at South East Efate, Vanuatu</li>
    </ul>
    <p style="color:#D4A853;font-family:Georgia,serif;font-size:16px;margin-top:24px;">— The E'Nauwi Team</p>
  </div>
  <div style="background:#083D63;padding:24px 30px;text-align:center;">
    <p style="color:#ffffff;opacity:0.6;font-size:12px;margin:0;">E'Nauwi Beach Resort · South East Efate, Vanuatu</p>
    <p style="color:#ffffff;opacity:0.6;font-size:12px;margin:4px 0 0;">📞 +678 22170 · ✉ info@enauwiresort.vu</p>
  </div>
</div>
</body>
</html>`
}

function staffInvitationHTML(data: { name: string; roleName: string; department: string; inviteUrl: string }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;">
  <div style="background:linear-gradient(135deg,#0A4B78,#0D5A91);padding:40px 30px;text-align:center;">
    <h1 style="color:#D4A853;font-size:28px;margin:0;font-family:Georgia,serif;">E'Nauwi Beach Resort</h1>
    <p style="color:#ffffff;opacity:0.8;margin:8px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Staff Invitation</p>
  </div>
  <div style="padding:30px;">
    <h2 style="color:#0A4B78;font-size:22px;margin:0 0 8px;">Welkam, ${data.name}!</h2>
    <p style="color:#666;line-height:1.6;">You have been invited to join the E'Nauwi Beach Resort team.</p>
    
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin:24px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#888;font-size:14px;">Position</td><td style="padding:8px 0;color:#0A4B78;font-weight:bold;text-align:right;font-size:14px;">${data.roleName}</td></tr>
        <tr><td style="padding:8px 0;color:#888;font-size:14px;">Department</td><td style="padding:8px 0;color:#333;text-align:right;font-size:14px;">${data.department || 'General'}</td></tr>
      </table>
    </div>
    
    <p style="color:#666;line-height:1.6;">Click the button below to complete your onboarding and set up your staff account:</p>
    
    <div style="margin:30px 0;text-align:center;">
      <a href="${data.inviteUrl}" style="display:inline-block;background:#D4A853;color:#0A4B78;padding:16px 40px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">Complete Onboarding</a>
    </div>
    
    <p style="color:#888;font-size:13px;">This invitation expires in 7 days. If you didn't expect this invitation, please ignore this email.</p>
    
    <p style="color:#D4A853;font-family:Georgia,serif;font-size:16px;margin-top:24px;">— The E'Nauwi Team</p>
  </div>
  <div style="background:#083D63;padding:24px 30px;text-align:center;">
    <p style="color:#ffffff;opacity:0.6;font-size:12px;margin:0;">E'Nauwi Beach Resort · South East Efate, Vanuatu</p>
    <p style="color:#ffffff;opacity:0.6;font-size:12px;margin:4px 0 0;">📞 +678 22170 · ✉ info@enauwiresort.vu</p>
  </div>
</div>
</body>
</html>`
}

function passwordResetHTML(data: { name: string; resetUrl: string }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;">
  <div style="background:linear-gradient(135deg,#0A4B78,#0D5A91);padding:40px 30px;text-align:center;">
    <h1 style="color:#D4A853;font-size:28px;margin:0;font-family:Georgia,serif;">E'Nauwi Beach Resort</h1>
    <p style="color:#ffffff;opacity:0.8;margin:8px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Password Reset</p>
  </div>
  <div style="padding:30px;">
    <h2 style="color:#0A4B78;font-size:22px;margin:0 0 8px;">Hello, ${data.name}!</h2>
    <p style="color:#666;line-height:1.6;">We received a request to reset your password for your E'Nauwi Beach Resort staff account.</p>
    
    <p style="color:#666;line-height:1.6;">Click the button below to set a new password:</p>
    
    <div style="margin:30px 0;text-align:center;">
      <a href="${data.resetUrl}" style="display:inline-block;background:#D4A853;color:#0A4B78;padding:16px 40px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">Reset Password</a>
    </div>
    
    <p style="color:#888;font-size:13px;">This link expires in 1 hour. If you didn't request a password reset, please ignore this email.</p>
    
    <p style="color:#888;font-size:13px;margin-top:20px;">Or copy and paste this link into your browser:</p>
    <p style="color:#0A4B78;font-size:12px;word-break:break-all;background:#f8fafc;padding:12px;border-radius:4px;">${data.resetUrl}</p>
    
    <p style="color:#D4A853;font-family:Georgia,serif;font-size:16px;margin-top:24px;">— The E'Nauwi Team</p>
  </div>
  <div style="background:#083D63;padding:24px 30px;text-align:center;">
    <p style="color:#ffffff;opacity:0.6;font-size:12px;margin:0;">E'Nauwi Beach Resort · South East Efate, Vanuatu</p>
    <p style="color:#ffffff;opacity:0.6;font-size:12px;margin:4px 0 0;">📞 +678 22170 · ✉ info@enauwiresort.vu</p>
  </div>
</div>
</body>
</html>`
}

function conciergeEmailHTML(data: { guestName: string; subject: string; body: string }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;">
  <div style="background:linear-gradient(135deg,#0A4B78,#0D5A91);padding:40px 30px;text-align:center;">
    <h1 style="color:#D4A853;font-size:28px;margin:0;font-family:Georgia,serif;">E'Nauwi Beach Resort</h1>
    <p style="color:#ffffff;opacity:0.8;margin:8px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">From Your Concierge</p>
  </div>
  <div style="padding:30px;">
    <h2 style="color:#0A4B78;font-size:22px;margin:0 0 8px;">Welkam, ${data.guestName}!</h2>
    <div style="color:#666;line-height:1.7;font-size:15px;">${data.body.replace(/\n/g, '<br>')}</div>
    <div style="margin-top:30px;text-align:center;">
      <a href="https://enauwi-resort.vercel.app/book" style="display:inline-block;background:#D4A853;color:#0A4B78;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">Book Your Stay</a>
    </div>
    <p style="color:#666;line-height:1.6;font-size:14px;margin-top:24px;">📞 Have questions? Call us at <strong>+678 22170</strong></p>
    <p style="color:#D4A853;font-family:Georgia,serif;font-size:16px;margin-top:24px;">— Your E'Nauwi Concierge</p>
  </div>
  <div style="background:#083D63;padding:24px 30px;text-align:center;">
    <p style="color:#ffffff;opacity:0.6;font-size:12px;margin:0;">E'Nauwi Beach Resort · South East Efate, Vanuatu</p>
  </div>
</div>
</body>
</html>`
}

function bookingAdminHTML(data: {
  guestName: string
  guestEmail: string
  guestPhone?: string
  roomName: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: string
  reference: string
  specialRequests?: string
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;">
  <div style="background:linear-gradient(135deg,#0A4B78,#0D5A91);padding:30px;text-align:center;">
    <h1 style="color:#D4A853;font-size:24px;margin:0;">🎉 New Booking Received!</h1>
  </div>
  <div style="padding:30px;">
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:24px;margin-bottom:20px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#888;font-size:14px;">Reference</td><td style="padding:6px 0;color:#0A4B78;font-weight:bold;text-align:right;">${data.reference}</td></tr>
        <tr><td style="padding:6px 0;color:#888;font-size:14px;">Guest</td><td style="padding:6px 0;color:#333;text-align:right;">${data.guestName}</td></tr>
        <tr><td style="padding:6px 0;color:#888;font-size:14px;">Email</td><td style="padding:6px 0;text-align:right;"><a href="mailto:${data.guestEmail}" style="color:#0A4B78;">${data.guestEmail}</a></td></tr>
        ${data.guestPhone ? `<tr><td style="padding:6px 0;color:#888;font-size:14px;">Phone</td><td style="padding:6px 0;color:#333;text-align:right;">${data.guestPhone}</td></tr>` : ''}
        <tr><td style="padding:6px 0;color:#888;font-size:14px;">Room</td><td style="padding:6px 0;color:#333;text-align:right;">${data.roomName}</td></tr>
        <tr><td style="padding:6px 0;color:#888;font-size:14px;">Check-in</td><td style="padding:6px 0;color:#333;text-align:right;">${data.checkIn}</td></tr>
        <tr><td style="padding:6px 0;color:#888;font-size:14px;">Check-out</td><td style="padding:6px 0;color:#333;text-align:right;">${data.checkOut}</td></tr>
        <tr><td style="padding:6px 0;color:#888;font-size:14px;">Guests</td><td style="padding:6px 0;color:#333;text-align:right;">${data.guests}</td></tr>
        ${data.specialRequests ? `<tr><td style="padding:6px 0;color:#888;font-size:14px;">Requests</td><td style="padding:6px 0;color:#333;text-align:right;">${data.specialRequests}</td></tr>` : ''}
        <tr style="border-top:2px solid #D4A853;"><td style="padding:10px 0;font-weight:bold;font-size:16px;">Total</td><td style="padding:10px 0;font-weight:bold;font-size:16px;text-align:right;color:#0A4B78;">${data.totalPrice}</td></tr>
      </table>
    </div>
    <p style="color:#888;font-size:12px;text-align:center;">Log in to the <a href="https://enauwi-resort.vercel.app/admin/bookings" style="color:#0A4B78;">admin dashboard</a> to manage this booking.</p>
  </div>
</div>
</body>
</html>`
}

// ─── API Handler ──────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json({ error: 'type and data are required' }, { status: 400 })
    }

    const results: { id?: string; error?: string }[] = []

    switch (type) {
      case 'booking_confirmation': {
        // Send to guest
        const guestResult = await resend.emails.send({
          from: FROM_NOREPLY,
          to: data.guestEmail,
          subject: `Booking Confirmation — ${data.reference} | E'Nauwi Beach Resort`,
          html: bookingConfirmationHTML(data),
        })
        results.push({ id: guestResult.data?.id, error: guestResult.error?.message })

        // Send to admins
        const adminResult = await resend.emails.send({
          from: FROM_NOREPLY,
          to: ADMIN_EMAILS,
          subject: `🎉 New Booking: ${data.reference} — ${data.guestName}`,
          html: bookingAdminHTML(data),
        })
        results.push({ id: adminResult.data?.id, error: adminResult.error?.message })
        break
      }

      case 'contact_form': {
        // Send to admins
        const adminResult = await resend.emails.send({
          from: FROM_NOREPLY,
          to: ADMIN_EMAILS,
          replyTo: data.email,
          subject: `Contact Form: ${data.subject} — ${data.name}`,
          html: contactFormAdminHTML(data),
        })
        results.push({ id: adminResult.data?.id, error: adminResult.error?.message })

        // Auto-reply to sender
        const autoReply = await resend.emails.send({
          from: FROM_NOREPLY,
          to: data.email,
          subject: `We've received your message | E'Nauwi Beach Resort`,
          html: contactAutoReplyHTML(data.name),
        })
        results.push({ id: autoReply.data?.id, error: autoReply.error?.message })
        break
      }

      case 'concierge_email': {
        const result = await resend.emails.send({
          from: FROM_CONCIERGE,
          to: data.guestEmail,
          subject: data.subject || `Info from E'Nauwi Beach Resort`,
          html: conciergeEmailHTML(data),
        })
        results.push({ id: result.data?.id, error: result.error?.message })
        break
      }

      case 'staff_invitation': {
        const result = await resend.emails.send({
          from: FROM_NOREPLY,
          to: data.email,
          subject: `You're Invited to Join E'Nauwi Beach Resort Team`,
          html: staffInvitationHTML(data),
        })
        results.push({ id: result.data?.id, error: result.error?.message })
        break
      }

      case 'password_reset': {
        const result = await resend.emails.send({
          from: FROM_NOREPLY,
          to: data.email,
          subject: `Reset Your Password | E'Nauwi Beach Resort`,
          html: passwordResetHTML(data),
        })
        results.push({ id: result.data?.id, error: result.error?.message })
        break
      }

      default:
        return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 })
    }

    const hasErrors = results.some(r => r.error)
    return NextResponse.json({ 
      success: !hasErrors, 
      results 
    }, { status: hasErrors ? 207 : 200 })

  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
