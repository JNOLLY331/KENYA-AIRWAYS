"""
generate_docs.py — Kenya Airways Online Booking System Documentation PDF
Run with:  python docs/generate_docs.py
Output:    docs/Kenya_Airways_Documentation.pdf
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.platypus.flowables import KeepInFrame
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# ── Output path ───────────────────────────────────────────────────────────────
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "Kenya_Airways_Documentation.pdf")

# ── Brand colours ─────────────────────────────────────────────────────────────
KA_RED    = colors.HexColor("#C01E2E")
KA_DARK   = colors.HexColor("#0D1B2A")
KA_BLUE   = colors.HexColor("#1B3A6B")
KA_LIGHT  = colors.HexColor("#F5F7FA")
KA_MUTED  = colors.HexColor("#6B7A99")
KA_BORDER = colors.HexColor("#D1D9E6")
KA_WHITE  = colors.white
KA_GREEN  = colors.HexColor("#16A34A")

PAGE_W, PAGE_H = A4


# ── Style helpers ─────────────────────────────────────────────────────────────
def build_styles():
    base = getSampleStyleSheet()
    styles = {}

    styles["cover_title"] = ParagraphStyle(
        "cover_title",
        fontName="Helvetica-Bold",
        fontSize=32,
        textColor=KA_WHITE,
        alignment=TA_CENTER,
        leading=40,
        spaceAfter=8,
    )
    styles["cover_sub"] = ParagraphStyle(
        "cover_sub",
        fontName="Helvetica",
        fontSize=14,
        textColor=colors.HexColor("#FFFFFF"),
        alignment=TA_CENTER,
        leading=20,
        spaceAfter=6,
    )
    styles["cover_meta"] = ParagraphStyle(
        "cover_meta",
        fontName="Helvetica",
        fontSize=11,
        textColor=colors.HexColor("#AABBD4"),
        alignment=TA_CENTER,
        leading=16,
    )
    styles["h1"] = ParagraphStyle(
        "h1",
        fontName="Helvetica-Bold",
        fontSize=18,
        textColor=KA_RED,
        spaceBefore=18,
        spaceAfter=8,
        leading=24,
        borderPad=4,
    )
    styles["h2"] = ParagraphStyle(
        "h2",
        fontName="Helvetica-Bold",
        fontSize=13,
        textColor=KA_BLUE,
        spaceBefore=14,
        spaceAfter=6,
        leading=18,
    )
    styles["h3"] = ParagraphStyle(
        "h3",
        fontName="Helvetica-Bold",
        fontSize=11,
        textColor=KA_DARK,
        spaceBefore=10,
        spaceAfter=4,
        leading=16,
    )
    styles["body"] = ParagraphStyle(
        "body",
        fontName="Helvetica",
        fontSize=10,
        textColor=KA_DARK,
        leading=15,
        spaceAfter=6,
        alignment=TA_JUSTIFY,
    )
    styles["bullet"] = ParagraphStyle(
        "bullet",
        fontName="Helvetica",
        fontSize=10,
        textColor=KA_DARK,
        leading=15,
        spaceBefore=2,
        spaceAfter=2,
        leftIndent=14,
        bulletIndent=4,
        bulletFontName="Helvetica-Bold",
        bulletFontSize=10,
    )
    styles["code"] = ParagraphStyle(
        "code",
        fontName="Courier",
        fontSize=9,
        textColor=colors.HexColor("#1E293B"),
        backColor=colors.HexColor("#F1F5F9"),
        leading=13,
        spaceAfter=4,
        leftIndent=8,
        rightIndent=8,
        borderPad=4,
    )
    styles["caption"] = ParagraphStyle(
        "caption",
        fontName="Helvetica-Oblique",
        fontSize=9,
        textColor=KA_MUTED,
        alignment=TA_CENTER,
        spaceAfter=8,
    )
    styles["toc_entry"] = ParagraphStyle(
        "toc_entry",
        fontName="Helvetica",
        fontSize=10,
        textColor=KA_DARK,
        leading=16,
        leftIndent=10,
    )
    return styles


def hr(color=KA_BORDER, thickness=0.5):
    return HRFlowable(width="100%", thickness=thickness, color=color, spaceAfter=6, spaceBefore=6)


def section_rule():
    return HRFlowable(width="100%", thickness=2, color=KA_RED, spaceAfter=8, spaceBefore=4)


# ── Cover page ────────────────────────────────────────────────────────────────
def draw_cover(canvas, doc):
    canvas.saveState()

    # Dark background panel
    canvas.setFillColor(KA_DARK)
    canvas.rect(0, PAGE_H * 0.38, PAGE_W, PAGE_H * 0.62, fill=1, stroke=0)

    # Red accent bar at top
    canvas.setFillColor(KA_RED)
    canvas.rect(0, PAGE_H - 12 * mm, PAGE_W, 12 * mm, fill=1, stroke=0)

    # Light lower section
    canvas.setFillColor(KA_LIGHT)
    canvas.rect(0, 0, PAGE_W, PAGE_H * 0.38, fill=1, stroke=0)

    # Red accent bar at bottom
    canvas.setFillColor(KA_RED)
    canvas.rect(0, 0, PAGE_W, 6 * mm, fill=1, stroke=0)

    # Diagonal decorative stripe
    canvas.setFillColor(colors.HexColor("#1B3A6B"))
    p = canvas.beginPath()
    p.moveTo(PAGE_W * 0.6, PAGE_H * 0.38)
    p.lineTo(PAGE_W, PAGE_H * 0.48)
    p.lineTo(PAGE_W, PAGE_H * 0.38)
    p.close()
    canvas.drawPath(p, fill=1, stroke=0)

    # Airplane icon text (Unicode)
    canvas.setFillColor(KA_WHITE)
    canvas.setFont("Helvetica-Bold", 48)
    canvas.drawCentredString(PAGE_W / 2, PAGE_H * 0.82, "✈")

    canvas.restoreState()


def cover_page(styles):
    els = []
    els.append(Spacer(1, 5.5 * cm))

    els.append(Paragraph("KENYA AIRWAYS", styles["cover_title"]))
    els.append(Paragraph("Online Booking System", ParagraphStyle(
        "CovSub", fontName="Helvetica", fontSize=20,
        textColor=colors.HexColor("#AABBD4"), alignment=TA_CENTER, leading=26, spaceAfter=4
    )))
    els.append(Spacer(1, 0.4 * cm))
    els.append(Paragraph("Project Documentation", styles["cover_sub"]))
    els.append(Spacer(1, 0.3 * cm))
    els.append(Paragraph("Version 1.0  ·  May 2026", styles["cover_meta"]))
    els.append(Spacer(1, 6.5 * cm))

    # Lower area metadata table
    meta_data = [
        ["Project:", "Kenya Airways Online Booking System"],
        ["Technology:", "Django 6 + React 18 (Vite)"],
        ["Database:", "PostgreSQL (Neon) / SQLite"],
        ["Deployment:", "Render (Backend) + Vercel (Frontend)"],
        ["Author:", "Japheth Anold Dindi"],
        ["Date:", "May 2026"],
    ]
    meta_table = Table(meta_data, colWidths=[4 * cm, 11 * cm])
    meta_table.setStyle(TableStyle([
        ("FONTNAME",  (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME",  (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE",  (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), KA_BLUE),
        ("TEXTCOLOR", (1, 0), (1, -1), KA_DARK),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [KA_WHITE, KA_LIGHT]),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.3, KA_BORDER),
        ("ROUNDEDCORNERS", [4]),
    ]))
    els.append(meta_table)
    els.append(PageBreak())
    return els


# ── Helpers ───────────────────────────────────────────────────────────────────
def bullet(text, styles):
    return Paragraph(f"\u2022  {text}", styles["bullet"])


def code_block(text, styles):
    # Escape special XML chars for Paragraph
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    lines = text.strip().split("\n")
    return [Paragraph(line if line else " ", styles["code"]) for line in lines]


def feature_table(rows, col_widths, styles):
    """Generic table with KA branding."""
    tbl = Table(rows, colWidths=col_widths, repeatRows=1)
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), KA_DARK),
        ("TEXTCOLOR",     (0, 0), (-1, 0), KA_WHITE),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, 0), 10),
        ("FONTNAME",      (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE",      (0, 1), (-1, -1), 9),
        ("TEXTCOLOR",     (0, 1), (-1, -1), KA_DARK),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [KA_WHITE, KA_LIGHT]),
        ("GRID",          (0, 0), (-1, -1), 0.3, KA_BORDER),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return tbl


# ── Header / Footer ───────────────────────────────────────────────────────────
def on_page(canvas, doc):
    canvas.saveState()
    # Header
    canvas.setFillColor(KA_RED)
    canvas.rect(0, PAGE_H - 8 * mm, PAGE_W, 8 * mm, fill=1, stroke=0)
    canvas.setFillColor(KA_WHITE)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(1.5 * cm, PAGE_H - 5.5 * mm, "✈  KENYA AIRWAYS — ONLINE BOOKING SYSTEM")
    canvas.setFont("Helvetica", 9)
    canvas.drawRightString(PAGE_W - 1.5 * cm, PAGE_H - 5.5 * mm, "Project Documentation v1.0")

    # Footer
    canvas.setStrokeColor(KA_BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(1.5 * cm, 1.4 * cm, PAGE_W - 1.5 * cm, 1.4 * cm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(KA_MUTED)
    canvas.drawString(1.5 * cm, 0.8 * cm, "© 2026 Kenya Airways Online Booking System")
    canvas.drawRightString(PAGE_W - 1.5 * cm, 0.8 * cm, f"Page {doc.page}")
    canvas.restoreState()


# ── Sections ──────────────────────────────────────────────────────────────────
def section_1_overview(styles, els):
    els.append(Paragraph("1. Project Overview", styles["h1"]))
    els.append(section_rule())
    els.append(Paragraph(
        "The Kenya Airways Online Booking System is a full-stack web application built "
        "to modernise and streamline the airline's booking operations. The platform serves "
        "two primary user groups: <b>passengers</b> who search for and book flights, and "
        "<b>airline staff/administrators</b> who manage flights, bookings, passengers, employees, "
        "and operational reports.",
        styles["body"]
    ))
    els.append(Spacer(1, 0.3 * cm))
    els.append(Paragraph(
        "Built with a Django REST Framework backend and a React 18 (Vite) frontend, "
        "the system follows a decoupled architecture where the frontend communicates "
        "with the backend exclusively via authenticated REST API calls using JSON Web Tokens (JWT).",
        styles["body"]
    ))
    els.append(Spacer(1, 0.3 * cm))
    els.append(Paragraph("Key Features", styles["h2"]))

    feat_rows = [
        ["Feature", "Description"],
        ["✈  Flight Search & Booking", "Search flights by route and date; book seats with real-time capacity management"],
        ["👤  User Registration", "Instant account creation — passwords are set directly, no email verification required"],
        ["🔐  JWT Authentication", "Secure login with 60-min access tokens and 7-day refresh tokens"],
        ["🔑  Password Reset", "Token-based password reset via email (no email verification on signup)"],
        ["🛡️  Role-Based Access", "Guest / User / Staff Member / Superuser permission hierarchy"],
        ["📊  Admin Dashboard", "Superuser overview of all bookings, flights, passengers, and employees"],
        ["👥  Employee Management", "Assign staff to flights and manage employee records"],
        ["🧾  PDF Ticket Generation", "Downloadable PDF booking tickets generated with ReportLab"],
        ["📰  Newsletter Subscription", "Email subscription for exclusive flight deals and new routes"],
        ["🖼️  Cloudinary Images", "Destination images hosted on Cloudinary CDN for fast loading"],
        ["📱  Responsive Design", "Mobile-first UI with dark/light mode support"],
    ]
    tbl = feature_table(feat_rows, [5 * cm, 11.5 * cm], styles)
    els.append(tbl)
    els.append(Spacer(1, 0.5 * cm))


def section_2_architecture(styles, els):
    els.append(Paragraph("2. System Architecture", styles["h1"]))
    els.append(section_rule())
    els.append(Paragraph(
        "The application uses a decoupled, service-oriented architecture with three core layers:",
        styles["body"]
    ))

    arch_rows = [
        ["Layer", "Technology", "Host"],
        ["Frontend SPA", "React 18 + Vite + React Router v6", "Vercel"],
        ["REST API", "Django 6 + DRF + SimpleJWT", "Render"],
        ["Relational DB", "PostgreSQL (Neon) / SQLite (local dev)", "Neon (cloud)"],
        ["Media Storage", "Cloudinary CDN", "Cloudinary"],
        ["Email Service", "Brevo API (django-anymail)", "Brevo"],
    ]
    tbl = feature_table(arch_rows, [4.5 * cm, 7.5 * cm, 4.5 * cm], styles)
    els.append(tbl)
    els.append(Spacer(1, 0.4 * cm))

    els.append(Paragraph("Data & Authentication Flow", styles["h2"]))
    for step in [
        "User authenticates via POST /api/users/login/ — receives an access token (60 min) and a refresh token (7 days).",
        "The React frontend stores tokens in localStorage and attaches the Bearer token to every API request via an Axios interceptor.",
        "When the access token expires, the interceptor automatically calls POST /api/users/token/refresh/ to obtain a new one.",
        "Superusers have full CRUD access; regular users see only their own bookings; staff members can manage assigned flights.",
    ]:
        els.append(bullet(step, styles))
    els.append(Spacer(1, 0.3 * cm))


def section_3_tech_stack(styles, els):
    els.append(Paragraph("3. Technology Stack", styles["h1"]))
    els.append(section_rule())

    els.append(Paragraph("Backend Dependencies", styles["h2"]))
    be_rows = [
        ["Package", "Version", "Purpose"],
        ["Django", "6.0.3", "Web framework"],
        ["djangorestframework", "3.17.0", "REST API layer"],
        ["djangorestframework-simplejwt", "5.5.1", "JWT authentication"],
        ["django-cors-headers", "4.9.0", "Cross-origin request handling"],
        ["django-anymail + Brevo", "15.0", "Transactional email (password reset)"],
        ["gunicorn", "25.3.0", "WSGI production server"],
        ["whitenoise", "6.12.0", "Static file serving"],
        ["psycopg2-binary", "2.9.11", "PostgreSQL database driver"],
        ["dj-database-url", "3.1.2", "DATABASE_URL string parser"],
        ["reportlab", "4.4.10", "PDF ticket generation"],
        ["cloudinary / django-cloudinary-storage", "1.44.1", "Image CDN"],
        ["django-unfold", "0.89.0", "Enhanced dark-mode admin UI"],
        ["python-decouple", "3.8", "Environment variable management"],
    ]
    tbl = feature_table(be_rows, [5.5 * cm, 2.5 * cm, 8.5 * cm], styles)
    els.append(tbl)
    els.append(Spacer(1, 0.4 * cm))

    els.append(Paragraph("Frontend Dependencies", styles["h2"]))
    fe_rows = [
        ["Package", "Purpose"],
        ["React 18 + Vite", "UI framework with lightning-fast HMR dev server"],
        ["React Router v6", "Client-side routing and navigation"],
        ["Axios", "HTTP client with interceptor-based token refresh"],
        ["Framer Motion", "Page transitions and micro-animations"],
        ["React Hot Toast", "User-friendly notification toasts"],
        ["React Icons (MdX / IoX)", "Comprehensive icon library"],
        ["Swiper JS", "Touch-friendly carousels for destinations"],
        ["jwt-decode", "Decode JWT payload for user state"],
    ]
    tbl = feature_table(fe_rows, [5.5 * cm, 11 * cm], styles)
    els.append(tbl)
    els.append(Spacer(1, 0.3 * cm))


def section_4_features(styles, els):
    els.append(Paragraph("4. Feature Descriptions", styles["h1"]))
    els.append(section_rule())

    features = [
        ("4.1  User Registration (No Email Verification)", [
            "Users complete the registration form with username, email, phone number, and password.",
            "The phone number is auto-formatted from Kenyan 07XXXXXXXX format to E.164 (+254XXXXXXXXX).",
            "On successful submission the account is immediately active — no email verification step is required.",
            "The user is redirected straight to the login page with a success notification.",
            "Duplicate email and username validation is enforced on both frontend and backend.",
        ]),
        ("4.2  Login & JWT Session Management", [
            "Users log in with email and password via POST /api/users/login/.",
            "On success, the backend returns an access token (60 min) and a refresh token (7 days).",
            "The frontend stores both tokens in localStorage and decodes the access token to populate user state.",
            "An Axios request interceptor transparently refreshes the access token when it nears expiry.",
            "On logout, the refresh token is blacklisted server-side to prevent reuse.",
        ]),
        ("4.3  Password Reset (No Email Verification Required)", [
            "Users navigate to /reset-password and enter their registered email address.",
            "The backend generates a time-limited UUID token (valid 1 hour) and emails a reset link.",
            "The user clicks the link in the email → /reset-password?token=<uuid>.",
            "The user sets a new password (min 8 characters, must match confirmation).",
            "On success the token is invalidated and the user is redirected to login.",
            "Email is sent via Brevo HTTPS API — no SMTP ports required (works on Render free tier).",
        ]),
        ("4.4  Flight Search & Booking", [
            "Authenticated users can browse available flights with route, date, and seat class details.",
            "The BookingForm component validates dates, seat class, and passenger details before submission.",
            "Seat capacity is checked server-side — if a flight is full, users are shown the next available flight.",
            "Each confirmed booking generates a unique booking reference and optionally a PDF ticket.",
        ]),
        ("4.5  Admin Dashboard", [
            "Accessible only to superusers at /admin-dashboard.",
            "Displays real-time statistics: total flights, bookings, passengers, and employees.",
            "Links to manage each entity group with full CRUD operations.",
            "The Django admin (/admin/) uses the Unfold theme for an enhanced dark-mode interface.",
        ]),
        ("4.6  Reports", [
            "Staff and administrators can generate operational reports from the Reports page.",
            "Reports summarise booking counts, revenue per route, and passenger distributions.",
            "PDF export is supported via ReportLab for offline record-keeping.",
        ]),
    ]

    for title, points in features:
        els.append(Paragraph(title, styles["h2"]))
        for p in points:
            els.append(bullet(p, styles))
        els.append(Spacer(1, 0.3 * cm))


def section_5_api(styles, els):
    els.append(Paragraph("5. API Endpoints", styles["h1"]))
    els.append(section_rule())
    els.append(Paragraph(
        "All endpoints are prefixed with /api/. Authentication uses Bearer JWT tokens "
        "passed in the Authorization header.",
        styles["body"]
    ))

    els.append(Paragraph("Authentication Endpoints (/api/users/)", styles["h2"]))
    auth_rows = [
        ["Method", "Endpoint", "Auth", "Description"],
        ["POST", "/api/users/register/", "No", "Create new account (active immediately)"],
        ["POST", "/api/users/login/", "No", "Login; returns access + refresh tokens"],
        ["POST", "/api/users/logout/", "Yes", "Blacklist refresh token"],
        ["GET",  "/api/users/profile/", "Yes", "Get logged-in user profile"],
        ["POST", "/api/users/request-password-reset/", "No", "Email password-reset link"],
        ["POST", "/api/users/confirm-password-reset/", "No", "Set new password with token"],
        ["POST", "/api/users/token/refresh/", "No", "Refresh access token"],
        ["POST", "/api/users/newsletter/", "No", "Subscribe to newsletter"],
    ]
    tbl = feature_table(auth_rows, [1.8 * cm, 6.5 * cm, 1.5 * cm, 6.7 * cm], styles)
    els.append(tbl)
    els.append(Spacer(1, 0.4 * cm))

    els.append(Paragraph("Core Resource Endpoints", styles["h2"]))
    res_rows = [
        ["Prefix", "Methods", "Description"],
        ["/api/flights/", "GET, POST, PUT, DELETE", "Flight management (CRUD)"],
        ["/api/bookings/", "GET, POST, PUT, DELETE", "Booking management (CRUD)"],
        ["/api/passengers/", "GET, POST, PUT, DELETE", "Passenger records (superuser only for write)"],
        ["/api/employees/", "GET, POST, PUT, DELETE", "Employee management"],
        ["/api/reports/", "GET, POST", "Report generation"],
        ["/api/helpdesk/", "GET, POST", "Help and support tickets"],
    ]
    tbl = feature_table(res_rows, [4.5 * cm, 5 * cm, 7 * cm], styles)
    els.append(tbl)
    els.append(Spacer(1, 0.3 * cm))


def section_6_permissions(styles, els):
    els.append(Paragraph("6. User Roles & Permissions", styles["h1"]))
    els.append(section_rule())

    perm_rows = [
        ["Permission", "Guest", "User", "Staff Member", "Superuser"],
        ["View Home & Flights", "✅", "✅", "✅", "✅"],
        ["Register / Login", "✅", "—", "—", "—"],
        ["Book a Flight", "❌", "✅", "✅", "✅"],
        ["View Own Bookings", "❌", "✅", "✅", "✅"],
        ["Manage Employees", "❌", "❌", "✅", "✅"],
        ["Admin Dashboard", "❌", "❌", "❌", "✅"],
        ["Create Passengers", "❌", "❌", "❌", "✅"],
        ["Delete Any Booking", "❌", "❌", "❌", "✅"],
        ["Django Admin Panel", "❌", "❌", "❌", "✅"],
    ]
    tbl = feature_table(perm_rows, [5 * cm, 2 * cm, 2 * cm, 3.5 * cm, 3.5 * cm], styles)
    els.append(tbl)
    els.append(Spacer(1, 0.3 * cm))


def section_7_setup(styles, els):
    els.append(Paragraph("7. Installation & Configuration", styles["h1"]))
    els.append(section_rule())

    els.append(Paragraph("7.1  Prerequisites", styles["h2"]))
    for item in [
        "Python 3.11 or later",
        "Node.js 18 or later + npm 9+",
        "Git",
        "A PostgreSQL database (or use SQLite for local development)",
    ]:
        els.append(bullet(item, styles))
    els.append(Spacer(1, 0.3 * cm))

    els.append(Paragraph("7.2  Backend Setup", styles["h2"]))
    steps = [
        ("Clone the repository and enter the backend directory:",
         "git clone <repository-url>\ncd \"KENYA AIRWAYS/backend\""),
        ("Create and activate a Python virtual environment:",
         "python3 -m venv venv\nsource venv/bin/activate   # Windows: venv\\Scripts\\activate"),
        ("Install Python dependencies:",
         "pip install -r requirements.txt"),
        ("Create backend/.env with required variables (see Section 8).", None),
        ("Apply database migrations:",
         "python manage.py migrate"),
        ("Create a superuser:",
         "python manage.py createsuperuser"),
        ("Start the development server:",
         "python manage.py runserver\n# API available at http://localhost:8000"),
    ]
    for i, (desc, code) in enumerate(steps, 1):
        els.append(Paragraph(f"<b>Step {i}.</b> {desc}", styles["body"]))
        if code:
            els += code_block(code, styles)
        els.append(Spacer(1, 0.15 * cm))

    els.append(Spacer(1, 0.2 * cm))
    els.append(Paragraph("7.3  Frontend Setup", styles["h2"]))
    fe_steps = [
        ("Enter the frontend directory and install Node dependencies:",
         "cd frontend\nnpm install"),
        ("Create frontend/.env:",
         "VITE_API_BASE_URL=http://localhost:8000"),
        ("Start the Vite development server:",
         "npm run dev\n# UI available at http://localhost:5173"),
    ]
    for i, (desc, code) in enumerate(fe_steps, 1):
        els.append(Paragraph(f"<b>Step {i}.</b> {desc}", styles["body"]))
        if code:
            els += code_block(code, styles)
        els.append(Spacer(1, 0.15 * cm))


def section_8_env(styles, els):
    els.append(Paragraph("8. Environment Variables", styles["h1"]))
    els.append(section_rule())
    els.append(Paragraph("Backend — backend/.env", styles["h2"]))
    env_rows = [
        ["Variable", "Required", "Description"],
        ["SECRET_KEY", "Yes", "Django secret key (50+ random chars)"],
        ["DEBUG", "Yes", "True for development, False for production"],
        ["ALLOWED_HOSTS", "Yes", "Comma-separated allowed hostnames"],
        ["DATABASE_URL", "Prod", "PostgreSQL connection string (blank = SQLite)"],
        ["BREVO_API_KEY", "Prod", "Brevo API key for sending emails"],
        ["DEFAULT_FROM_EMAIL", "Prod", "Sender email address (must be verified in Brevo)"],
        ["FRONTEND_URL", "Prod", "Full URL of the frontend (for email links)"],
        ["BACKEND_URL", "Prod", "Full URL of the backend"],
        ["CLOUDINARY_CLOUD_NAME", "Prod", "Cloudinary cloud name"],
        ["CLOUDINARY_API_KEY", "Prod", "Cloudinary API key"],
        ["CLOUDINARY_API_SECRET", "Prod", "Cloudinary API secret"],
    ]
    tbl = feature_table(env_rows, [5 * cm, 1.8 * cm, 9.7 * cm], styles)
    els.append(tbl)
    els.append(Spacer(1, 0.3 * cm))
    els.append(Paragraph("Frontend — frontend/.env", styles["h2"]))
    fe_env_rows = [
        ["Variable", "Description"],
        ["VITE_API_BASE_URL", "Full URL of the Django backend API (e.g. http://localhost:8000 or https://your-api.onrender.com)"],
    ]
    tbl = feature_table(fe_env_rows, [5 * cm, 11.5 * cm], styles)
    els.append(tbl)
    els.append(Spacer(1, 0.3 * cm))


def section_9_deployment(styles, els):
    els.append(Paragraph("9. Production Deployment", styles["h1"]))
    els.append(section_rule())

    els.append(Paragraph("9.1  Backend on Render", styles["h2"]))
    for step in [
        "Create a new Web Service on render.com and connect your GitHub repository.",
        "Set Runtime to Python 3.",
        'Set Build Command to: pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate',
        "Set Start Command to: gunicorn config.wsgi:application",
        "Add all environment variables from Section 8 in the Render dashboard.",
        "Set DEBUG=False and ALLOWED_HOSTS to include your Render domain.",
        "Add the Render domain to CORS_ALLOWED_ORIGINS and CSRF_TRUSTED_ORIGINS in settings.py.",
    ]:
        els.append(bullet(step, styles))
    els.append(Spacer(1, 0.3 * cm))

    els.append(Paragraph("9.2  Frontend on Vercel", styles["h2"]))
    for step in [
        "Import the repository on vercel.com.",
        "Set the Root Directory to frontend.",
        "Set Framework Preset to Vite.",
        "Add Environment Variable: VITE_API_BASE_URL = https://your-backend.onrender.com",
        "Deploy. Vercel rebuilds automatically on every git push to the main branch.",
    ]:
        els.append(bullet(step, styles))
    els.append(Spacer(1, 0.3 * cm))


def section_10_screenshots(styles, els):
    els.append(Paragraph("10. System Screenshots", styles["h1"]))
    els.append(section_rule())
    els.append(Paragraph(
        "The following pages are available in the application. Screenshots demonstrating "
        "the UI are to be inserted here for the final submission.",
        styles["body"]
    ))
    els.append(Spacer(1, 0.3 * cm))

    pages = [
        ("Home Page", "Landing page with hero section, popular destinations carousel, features overview, about section, and newsletter signup."),
        ("Login Page", "Email and password login form with JWT authentication. Forgot password link navigates to Reset Password page."),
        ("Register Page", "Account creation form with username, email, E.164 phone number, and password. Account is active immediately — no email verification step."),
        ("Reset Password — Step 1", "User enters their email address and receives a password-reset link via email."),
        ("Reset Password — Step 2", "User sets a new password using the token from the email link. Token expires after 1 hour."),
        ("Flights Page", "Browse and search all available flights. Authenticated users can proceed to booking."),
        ("Booking Page", "Multi-field booking form: select flight, seat class, passengers, and payment. Real-time seat availability check."),
        ("Profile Page", "Logged-in user's account details: username, email, phone number, and staff status."),
        ("Passengers Page", "List of registered passengers. Full CRUD available to superusers."),
        ("Employees Page", "View and manage airline staff members and their assigned flights."),
        ("Reports Page", "Operational summary reports with PDF export support."),
        ("Admin Dashboard", "Superuser-only statistics dashboard: bookings, flights, passengers, employees."),
        ("Help Page", "FAQ accordion, contact information, and support ticket submission."),
        ("Django Admin (/admin/)", "Enhanced admin panel using Unfold theme with dark mode and navigation sidebar."),
    ]

    for name, desc in pages:
        row = [
            [Paragraph(f"<b>{name}</b>", styles["body"]),
             Paragraph(desc, styles["body"])],
        ]
        pg_tbl = Table([[Paragraph(f"<b>{name}</b>", styles["body"]),
                         Paragraph(desc, styles["body"])]],
                       colWidths=[4.5 * cm, 12 * cm])
        pg_tbl.setStyle(TableStyle([
            ("BACKGROUND",  (0, 0), (0, 0), KA_LIGHT),
            ("FONTNAME",    (0, 0), (0, 0), "Helvetica-Bold"),
            ("GRID",        (0, 0), (-1, -1), 0.3, KA_BORDER),
            ("TOPPADDING",  (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING",(0,0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("VALIGN",      (0, 0), (-1, -1), "MIDDLE"),
        ]))
        els.append(pg_tbl)

    els.append(Spacer(1, 0.5 * cm))
    els.append(Paragraph(
        "Note: Actual screenshots are to be captured from a running instance of the "
        "application and inserted into this section for the final PDF submission.",
        ParagraphStyle("note", fontName="Helvetica-Oblique", fontSize=9,
                       textColor=KA_MUTED, leading=14, leftIndent=10)
    ))


# ── Build the PDF ─────────────────────────────────────────────────────────────
def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        leftMargin=1.8 * cm,
        rightMargin=1.8 * cm,
        topMargin=1.8 * cm,
        bottomMargin=2 * cm,
        title="Kenya Airways Booking System — Project Documentation",
        author="Japheth Anold Dindi",
        subject="Full-Stack Web Application Documentation",
    )

    styles = build_styles()
    story = []

    # Cover page (first onFirstPage calls draw_cover for the cover)
    story += cover_page(styles)

    # Table of Contents placeholder
    story.append(Paragraph("Table of Contents", styles["h1"]))
    story.append(section_rule())
    toc_items = [
        "1.  Project Overview",
        "2.  System Architecture",
        "3.  Technology Stack",
        "4.  Feature Descriptions",
        "5.  API Endpoints",
        "6.  User Roles & Permissions",
        "7.  Installation & Configuration",
        "8.  Environment Variables",
        "9.  Production Deployment",
        "10. System Screenshots (placeholder for submission)",
    ]
    for item in toc_items:
        story.append(Paragraph(item, styles["toc_entry"]))
    story.append(PageBreak())

    # Main sections
    section_1_overview(styles, story)
    story.append(PageBreak())

    section_2_architecture(styles, story)
    section_3_tech_stack(styles, story)
    story.append(PageBreak())

    section_4_features(styles, story)
    story.append(PageBreak())

    section_5_api(styles, story)
    section_6_permissions(styles, story)
    story.append(PageBreak())

    section_7_setup(styles, story)
    story.append(PageBreak())

    section_8_env(styles, story)
    section_9_deployment(styles, story)
    story.append(PageBreak())

    section_10_screenshots(styles, story)

    # Build with cover draw function on page 1
    def first_page(canvas, doc):
        draw_cover(canvas, doc)
        # No header/footer on cover

    def later_pages(canvas, doc):
        on_page(canvas, doc)

    doc.build(story, onFirstPage=first_page, onLaterPages=later_pages)
    print(f"PDF generated: {OUTPUT_PATH}")


if __name__ == "__main__":
    build_pdf()
