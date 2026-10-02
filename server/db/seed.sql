-- 707 Activation Builder Seed Data
-- Clean Cloud Database Schema & Templates Presets

-- Brand Accounts are managed live via Superadmin Governance (/api/brands)

-- Initial Global Templates (Created and curated by Head of UI/UX)
INSERT INTO templates (name, slug, description, category, widget_tree) VALUES
(
    'Hype Sneaker Raffle Standard',
    'hype-sneaker-raffle-std',
    'Official 707 Sneaker Raffle template with countdown timer, shoe sizing selector (US/UK/EU), Instagram verification, and terms accordion.',
    'raffle',
    '[
        {
            "id": "hero_1",
            "type": "HeroDrop",
            "props": {
                "title": "EXCLUSIVE DROP",
                "subtitle": "LIMITED ALLOCATION RAFFLE",
                "badge": "ONLINE EXCLUSIVE",
                "imageUrl": "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80",
                "dropDate": "2026-10-01T10:00:00Z"
            }
        },
        {
            "id": "countdown_1",
            "type": "CountdownTimer",
            "props": {
                "label": "RAFFLE CLOSES IN",
                "targetDate": "2026-10-01T23:59:59Z",
                "expiredText": "RAFFLE CLOSED"
            }
        },
        {
            "id": "raffle_form_1",
            "type": "RaffleForm",
            "props": {
                "heading": "ENTER RAFFLE",
                "subheading": "One entry per verified ID/KTP",
                "sizeSystem": "US Mens",
                "sizes": ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"],
                "requireInstagram": true,
                "requirePhone": true,
                "ctaLabel": "SUBMIT ENTRY"
            }
        },
        {
            "id": "rules_1",
            "type": "RulesAccordion",
            "props": {
                "title": "TERMS & CONDITIONS",
                "items": [
                    {"title": "Eligibility", "content": "Open to Indonesian residents with valid KTP/ID."},
                    {"title": "Winning Notification", "content": "Winners will receive WhatsApp and Email confirmation with payment instructions."},
                    {"title": "Payment & Collection", "content": "Must complete payment within 2 hours of notification. In-store pickup or secure dispatch."}
                ]
            }
        }
    ]'::jsonb
),
(
    'VIP Brand Event RSVP Pass',
    'vip-brand-event-rsvp',
    'Exclusive brand opening and secret pop-up RSVP with digital pass preview and capacity quota.',
    'rsvp',
    '[
        {
            "id": "hero_rsvp_1",
            "type": "HeroDrop",
            "props": {
                "title": "PRIVATE VIP PREVIEW",
                "subtitle": "AUTUMN / WINTER ACTIVATION",
                "badge": "INVITATION ONLY",
                "imageUrl": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80",
                "dropDate": "2026-10-15T18:00:00Z"
            }
        },
        {
            "id": "rsvp_form_1",
            "type": "RsvpForm",
            "props": {
                "heading": "CONFIRM ATTENDANCE",
                "subheading": "Limited to 150 passes",
                "sessions": [
                    {"label": "Session A: 18:00 - 20:00", "remaining": 24},
                    {"label": "Session B: 20:00 - 22:00", "remaining": 18}
                ],
                "includePlusOne": true,
                "ctaLabel": "RESERVE MY PASS"
            }
        },
        {
            "id": "location_1",
            "type": "LocationCard",
            "props": {
                "venueName": "707 Space Jakarta",
                "address": "Jl. Kemang Raya No. 707, Jakarta Selatan",
                "googleMapsUrl": "https://maps.google.com"
            }
        }
    ]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
