import io
import qrcode
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, inch
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph,
    Spacer, HRFlowable, Image as RLImage
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from bookings.models import Booking
from employees.models import Assignment
from django.utils import timezone


# ── Colour palette ────────────────────────────────────────────────────
KQ_RED   = colors.HexColor('#d71920')
KQ_GREEN = colors.HexColor('#006b3f')
KQ_BLACK = colors.black
KQ_WHITE = colors.white
KQ_LIGHT = colors.HexColor('#f5f5f5')
KQ_GREY  = colors.HexColor('#666666')


def _styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle('KQTitle', fontSize=22, leading=26,
                               textColor=KQ_WHITE, alignment=TA_CENTER,
                               fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle('KQSub', fontSize=11, leading=14,
                               textColor=KQ_WHITE, alignment=TA_CENTER))
    styles.add(ParagraphStyle('KQLabel', fontSize=9, leading=11,
                               textColor=KQ_GREY, fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle('KQValue', fontSize=11, leading=14,
                               textColor=KQ_BLACK))
    styles.add(ParagraphStyle('KQCode', fontSize=24, leading=28,
                               textColor=KQ_RED, alignment=TA_CENTER,
                               fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle('Footer', fontSize=8, leading=10,
                               textColor=KQ_GREY, alignment=TA_CENTER))
    return styles


def _qr_image(data: str, size: int = 80) -> RLImage:
    """Generate a QR code and return it as a ReportLab Image."""
    qr = qrcode.QRCode(box_size=4, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color='black', back_color='white')
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return RLImage(buf, width=size, height=size)


# ─────────────────────────────────────────────────────────────────────
# 1.  SINGLE TICKET
# ─────────────────────────────────────────────────────────────────────
def generate_ticket_pdf(booking_id: int) -> bytes:
    """Return PDF bytes for a single booking ticket."""
    booking = (
        Booking.objects
        .select_related('passenger', 'flight', 'user')
        .get(pk=booking_id)
    )
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                             leftMargin=15*mm, rightMargin=15*mm,
                             topMargin=10*mm, bottomMargin=10*mm)
    styles = _styles()
    story = []

    # ── Header band ──────────────────────────────────────────────────
    header_data = [[
        Paragraph('🛫  KENYA AIRWAYS', styles['KQTitle']),
        Paragraph('BOARDING PASS', styles['KQSub']),
    ]]
    header_tbl = Table(header_data, colWidths=['70%', '30%'])
    header_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), KQ_RED),
        ('VALIGN',     (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [KQ_RED]),
        ('TOPPADDING',    (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING',   (0, 0), (-1, -1), 10),
        ('RIGHTPADDING',  (0, 0), (-1, -1), 10),
    ]))
    story.append(header_tbl)
    story.append(Spacer(1, 6*mm))

    # ── Booking code ──────────────────────────────────────────────────
    story.append(Paragraph(f'Booking Reference: {booking.booking_code}', styles['KQCode']))
    story.append(Spacer(1, 4*mm))
    story.append(HRFlowable(width='100%', thickness=1, color=KQ_RED))
    story.append(Spacer(1, 4*mm))

    # ── Route ─────────────────────────────────────────────────────────
    f = booking.flight
    route_data = [
        [
            Paragraph(f.origin.upper(), ParagraphStyle('Big', fontSize=28, fontName='Helvetica-Bold',
                                                        textColor=KQ_BLACK, alignment=TA_CENTER)),
            Paragraph('✈', ParagraphStyle('Arrow', fontSize=22, alignment=TA_CENTER, textColor=KQ_RED)),
            Paragraph(f.destination.upper(), ParagraphStyle('Big2', fontSize=28, fontName='Helvetica-Bold',
                                                              textColor=KQ_BLACK, alignment=TA_CENTER)),
        ]
    ]
    route_tbl = Table(route_data, colWidths=['40%', '20%', '40%'])
    route_tbl.setStyle(TableStyle([
        ('ALIGN',  (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(route_tbl)
    story.append(Spacer(1, 4*mm))

    # ── Detail grid ───────────────────────────────────────────────────
    class_map = {'A': 'Executive', 'B': 'Middle Class', 'C': 'Low Class'}
    detail_data = [
        [Paragraph('Passenger', styles['KQLabel']),
         Paragraph(booking.passenger.full_name, styles['KQValue']),
         Paragraph('Passport No.', styles['KQLabel']),
         Paragraph(booking.passenger.passport_number, styles['KQValue'])],
        [Paragraph('Flight No.', styles['KQLabel']),
         Paragraph(f.flight_number, styles['KQValue']),
         Paragraph('Class', styles['KQLabel']),
         Paragraph(class_map.get(booking.travel_class, booking.travel_class), styles['KQValue'])],
        [Paragraph('Departure', styles['KQLabel']),
         Paragraph(f.departure_time.strftime('%d %b %Y  %H:%M'), styles['KQValue']),
         Paragraph('Arrival', styles['KQLabel']),
         Paragraph(f.arrival_time.strftime('%d %b %Y  %H:%M'), styles['KQValue'])],
        [Paragraph('Seat', styles['KQLabel']),
         Paragraph(booking.seat_number or '—', styles['KQValue']),
         Paragraph('Status', styles['KQLabel']),
         Paragraph(booking.booking_status, styles['KQValue'])],
    ]
    det_tbl = Table(detail_data, colWidths=['18%', '32%', '18%', '32%'])
    det_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), KQ_LIGHT),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [KQ_LIGHT, KQ_WHITE]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dddddd')),
        ('TOPPADDING',    (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING',   (0, 0), (-1, -1), 8),
        ('RIGHTPADDING',  (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(det_tbl)
    story.append(Spacer(1, 6*mm))

    # ── QR Code ───────────────────────────────────────────────────────
    qr_img = _qr_image(booking.booking_code, size=90)
    qr_data = [[qr_img, Paragraph(
        f'Scan QR code at the gate<br/>'
        f'Booking Code: <b>{booking.booking_code}</b><br/>'
        f'Contact: {booking.passenger.phone}<br/>'
        f'Email: {booking.passenger.email}',
        styles['KQValue']
    )]]
    qr_tbl = Table(qr_data, colWidths=['25%', '75%'])
    qr_tbl.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING',  (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('BACKGROUND', (0, 0), (-1, -1), KQ_LIGHT),
    ]))
    story.append(qr_tbl)
    story.append(Spacer(1, 8*mm))
    story.append(HRFlowable(width='100%', thickness=1, color=KQ_GREEN))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph(
        'This is your official Kenya Airways e-ticket. '
        'Please arrive at the airport at least 2 hours before departure.<br/>'
        'For assistance call +254 20 327 4747 or visit www.kenya-airways.com',
        styles['Footer']
    ))

    doc.build(story)
    buf.seek(0)
    return buf.read()


# ─────────────────────────────────────────────────────────────────────
# 2.  DAILY BOOKING REPORT
# ─────────────────────────────────────────────────────────────────────
def generate_daily_report_pdf(date=None) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                             leftMargin=15*mm, rightMargin=15*mm,
                             topMargin=10*mm, bottomMargin=10*mm)
    styles = _styles()
    story = []

    # Header
    story.append(Paragraph('Kenya Airways — Daily Booking Report', styles['KQTitle']))

    if date is None:
        date = timezone.now().date()
    story.append(Paragraph(f'Date: {date.strftime("%A, %d %B %Y")}', styles['KQSub']))
    story.append(Spacer(1, 6*mm))

    bookings = Booking.objects.filter(
        created_at__date=date
    ).select_related('passenger', 'flight').order_by('created_at')

    if not bookings.exists():
        story.append(Paragraph('No bookings recorded for this date.', styles['KQValue']))
    else:
        class_map = {'A': 'Executive', 'B': 'Middle', 'C': 'Low'}
        headers = ['#', 'Booking Code', 'Passenger', 'Flight', 'Route', 'Class', 'Status']
        data = [headers]
        for i, b in enumerate(bookings, 1):
            data.append([
                str(i),
                b.booking_code,
                b.passenger.full_name,
                b.flight.flight_number,
                f'{b.flight.origin} → {b.flight.destination}',
                class_map.get(b.travel_class, b.travel_class),
                b.booking_status,
            ])

        col_widths = [8*mm, 32*mm, 40*mm, 25*mm, 50*mm, 22*mm, 25*mm]
        tbl = Table(data, colWidths=col_widths, repeatRows=1)
        tbl.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), KQ_RED),
            ('TEXTCOLOR',  (0, 0), (-1, 0), KQ_WHITE),
            ('FONTNAME',   (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE',   (0, 0), (-1, 0), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [KQ_WHITE, KQ_LIGHT]),
            ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#cccccc')),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('TOPPADDING',    (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING',   (0, 0), (-1, -1), 4),
            ('RIGHTPADDING',  (0, 0), (-1, -1), 4),
        ]))
        story.append(tbl)
        story.append(Spacer(1, 4*mm))
        story.append(Paragraph(f'Total bookings: {bookings.count()}', styles['KQValue']))

    story.append(Spacer(1, 6*mm))
    story.append(HRFlowable(width='100%', thickness=1, color=KQ_GREEN))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph(f'Generated: {timezone.now().strftime("%d %b %Y %H:%M")} UTC', styles['Footer']))

    doc.build(story)
    buf.seek(0)
    return buf.read()


# ─────────────────────────────────────────────────────────────────────
# 3.  EMPLOYEE ASSIGNMENT REPORT
# ─────────────────────────────────────────────────────────────────────
def generate_employee_report_pdf() -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                             leftMargin=15*mm, rightMargin=15*mm,
                             topMargin=10*mm, bottomMargin=10*mm)
    styles = _styles()
    story = []

    story.append(Paragraph('Kenya Airways — Employee Assignment Report', styles['KQTitle']))
    story.append(Paragraph(f'Generated: {timezone.now().strftime("%d %B %Y")}', styles['KQSub']))
    story.append(Spacer(1, 6*mm))

    assignments = Assignment.objects.select_related(
        'employee', 'flight'
    ).all().order_by('flight__departure_time')

    if not assignments.exists():
        story.append(Paragraph('No assignments found.', styles['KQValue']))
    else:
        headers = ['#', 'Employee', 'ID', 'Role', 'Flight', 'Route', 'Departure', 'Date Assigned']
        data = [headers]
        for i, a in enumerate(assignments, 1):
            data.append([
                str(i),
                a.employee.name,
                a.employee.employee_id,
                a.employee.role,
                a.flight.flight_number,
                f'{a.flight.origin} → {a.flight.destination}',
                a.flight.departure_time.strftime('%d %b %Y %H:%M'),
                a.assigned_at.strftime('%d %b %Y'),
            ])

        col_widths = [8*mm, 32*mm, 20*mm, 25*mm, 22*mm, 45*mm, 32*mm, 22*mm]
        tbl = Table(data, colWidths=col_widths, repeatRows=1)
        tbl.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), KQ_GREEN),
            ('TEXTCOLOR',  (0, 0), (-1, 0), KQ_WHITE),
            ('FONTNAME',   (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE',   (0, 0), (-1, 0), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [KQ_WHITE, KQ_LIGHT]),
            ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#cccccc')),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('TOPPADDING',    (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING',   (0, 0), (-1, -1), 4),
            ('RIGHTPADDING',  (0, 0), (-1, -1), 4),
        ]))
        story.append(tbl)
        story.append(Spacer(1, 4*mm))
        story.append(Paragraph(f'Total assignments: {assignments.count()}', styles['KQValue']))

    story.append(Spacer(1, 6*mm))
    story.append(HRFlowable(width='100%', thickness=1, color=KQ_RED))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph('Kenya Airways — Confidential Internal Document', styles['Footer']))

    doc.build(story)
    buf.seek(0)
    return buf.read()
