const { Resend } = require("resend")

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM || "onboarding@resend.dev"

// ─── Existing: notify user on status change ───────────────────────────────────

const templates = {
  UNDER_VERIFICATION: (name, id, materiel, operator) => ({
    subject: `🔧 Problem #${id} is under review`,
    html: `
      <h2>Hello ${name},</h2>
      <p>Your reported problem <strong>#${id}</strong> for <strong>${materiel}</strong> is now under verification.</p>
      <p>Assigned operator: <strong>${operator}</strong></p>
      <p>We will keep you updated on the progress.</p>
      <br/><p>IT Equipment Management Team</p>
    `,
  }),
  SENT_TO_COMPANY: (name, id, materiel, company) => ({
    subject: `🚚 Problem #${id} — Device sent for repair`,
    html: `
      <h2>Hello ${name},</h2>
      <p>Your device (<strong>${materiel}</strong>) for problem <strong>#${id}</strong> has been sent to <strong>${company}</strong> for repair.</p>
      <p>We will notify you once it returns.</p>
      <br/><p>IT Equipment Management Team</p>
    `,
  }),
  REPAIRED: (name, id, materiel) => ({
    subject: `✅ Problem #${id} — Device repaired`,
    html: `
      <h2>Hello ${name},</h2>
      <p>Great news! Your device (<strong>${materiel}</strong>) for problem <strong>#${id}</strong> has been repaired.</p>
      <p>Please contact IT to collect your device.</p>
      <br/><p>IT Equipment Management Team</p>
    `,
  }),
  REPLACED: (name, id, materiel) => ({
    subject: `🔄 Problem #${id} — Device replaced`,
    html: `
      <h2>Hello ${name},</h2>
      <p>Your device (<strong>${materiel}</strong>) for problem <strong>#${id}</strong> could not be repaired and has been replaced.</p>
      <p>Please contact IT to collect your new device.</p>
      <br/><p>IT Equipment Management Team</p>
    `,
  }),
  CLOSED: (name, id, materiel) => ({
    subject: `✔️ Problem #${id} — Closed`,
    html: `
      <h2>Hello ${name},</h2>
      <p>Problem <strong>#${id}</strong> for your device (<strong>${materiel}</strong>) has been officially closed.</p>
      <p>Thank you for your patience.</p>
      <br/><p>IT Equipment Management Team</p>
    `,
  }),
}

const sendStatusNotification = async ({
  userEmail,
  userName,
  status,
  problemeId,
  materiel,
  operatorName,
  companyName,
}) => {
  const template = templates[status]
  if (!template) return

  const extra =
    status === "UNDER_VERIFICATION" ? operatorName
    : status === "SENT_TO_COMPANY" ? companyName
    : null

  const { subject, html } = template(userName, problemeId, materiel, extra)

  try {
    await resend.emails.send({ from: FROM, to: userEmail, subject, html })
    console.log(`✉️  Status email sent to ${userEmail} [${status}]`)
  } catch (err) {
    console.error("Status email failed:", err.message)
  }
}

// ─── NEW: notify all admins when a problem is declared ────────────────────────

const sendNewProblemToAdmins = async ({
  adminEmails,   // string[]
  problemeId,
  materiel,      // e.g. "Dell Latitude"
  declaredByName,
  declaredByEmail,
  description,
}) => {
  if (!adminEmails || adminEmails.length === 0) return

  const subject = `🚨 New Problem Declared — #${problemeId}`
  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2>New Problem Reported</h2>
      <p>A new IT problem has been declared and requires your attention.</p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr>
          <td style="padding: 8px; background: #f3f4f6; font-weight: 600; width: 40%;">Problem ID</td>
          <td style="padding: 8px;">#${problemeId}</td>
        </tr>
        <tr>
          <td style="padding: 8px; background: #f3f4f6; font-weight: 600;">Device</td>
          <td style="padding: 8px;">${materiel}</td>
        </tr>
        <tr>
          <td style="padding: 8px; background: #f3f4f6; font-weight: 600;">Declared By</td>
          <td style="padding: 8px;">${declaredByName} (${declaredByEmail})</td>
        </tr>
        <tr>
          <td style="padding: 8px; background: #f3f4f6; font-weight: 600;">Description</td>
          <td style="padding: 8px;">${description}</td>
        </tr>
      </table>

      <p style="margin-top: 24px;">
        <a
          href="${process.env.FRONTEND_URL}/dashboard/problemes/${problemeId}"
          style="
            display: inline-block;
            padding: 10px 20px;
            background: #2563eb;
            color: #fff;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
          "
        >View Problem</a>
      </p>
      <p style="color: #6b7280; font-size: 13px;">IT Equipment Management System</p>
    </div>
  `

  try {
    await resend.emails.send({ from: FROM, to: adminEmails, subject, html })
    console.log(`✉️  New problem email sent to admins [#${problemeId}]`)
  } catch (err) {
    console.error("Admin notification email failed:", err.message)
  }
}

// ─── NEW: notify operator when assigned to a problem ─────────────────────────

const sendOperatorAssignment = async ({
  operatorEmail,
  operatorName,
  problemeId,
  materiel,
  declaredByName,
  description,
}) => {
  const subject = `🔧 You've been assigned to Problem #${problemeId}`
  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2>New Assignment</h2>
      <p>Hello <strong>${operatorName}</strong>,</p>
      <p>You have been assigned to investigate and resolve the following IT problem.</p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr>
          <td style="padding: 8px; background: #f3f4f6; font-weight: 600; width: 40%;">Problem ID</td>
          <td style="padding: 8px;">#${problemeId}</td>
        </tr>
        <tr>
          <td style="padding: 8px; background: #f3f4f6; font-weight: 600;">Device</td>
          <td style="padding: 8px;">${materiel}</td>
        </tr>
        <tr>
          <td style="padding: 8px; background: #f3f4f6; font-weight: 600;">Reported By</td>
          <td style="padding: 8px;">${declaredByName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; background: #f3f4f6; font-weight: 600;">Description</td>
          <td style="padding: 8px;">${description}</td>
        </tr>
      </table>

      <p style="margin-top: 24px;">
        <a
          href="${process.env.FRONTEND_URL}/dashboard/problemes/${problemeId}"
          style="
            display: inline-block;
            padding: 10px 20px;
            background: #2563eb;
            color: #fff;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
          "
        >View Problem</a>
      </p>
      <p style="color: #6b7280; font-size: 13px;">IT Equipment Management System</p>
    </div>
  `

  try {
    await resend.emails.send({ from: FROM, to: operatorEmail, subject, html })
    console.log(`✉️  Assignment email sent to operator ${operatorEmail} [#${problemeId}]`)
  } catch (err) {
    console.error("Operator assignment email failed:", err.message)
  }
}

module.exports = {
  sendStatusNotification,
  sendNewProblemToAdmins,
  sendOperatorAssignment,
}