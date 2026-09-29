-- 707 Activation Builder Seed Data
-- 20 Brand Accounts & Initial Global Presets

INSERT INTO brands (name, slug, description, primary_color) VALUES
('atmos Indonesia', 'atmos', 'atmos streetwear and exclusive sneaker destination', '#000000'),
('Fred Perry', 'fred-perry', 'Iconic British laurel wreath sportswear and apparel', '#1a1a1a'),
('Vans Store Indonesia', 'vans', 'Action sports footwear and apparel', '#c8102e'),
('Converse Flagship', 'converse', 'Classic Chuck Taylor and collaborative drops', '#000000'),
('ASICS SportStyle', 'asics', 'Performance and lifestyle sneaker collaborations', '#001e62'),
('New Balance Heritage', 'new-balance', 'Craftsmanship and running silhouette drops', '#cc0000'),
('Salomon Sportstyle', 'salomon', 'Trail running and technical outdoor footwear', '#111111'),
('Carhartt WIP', 'carhartt-wip', 'Workwear in progress and streetwear essentials', '#d49b42'),
('Stüssy Chapter', 'stussy', 'Tribe culture and seasonal hype collections', '#000000'),
('Pleasures', 'pleasures', 'Punk, grunge, and modern graphic apparel', '#000000'),
('Neighborhood Japan', 'neighborhood', 'Craft with pride Tokyo streetwear', '#1f1f1f'),
('Beams Plus', 'beams-plus', 'Japanese timeless menswear aesthetics', '#e65c00'),
('Puma Select', 'puma', 'Heritage motorsport and street collaborations', '#000000'),
('Mizuno Sportstyle', 'mizuno', 'Japanese performance running and Kazoku drops', '#0d1b2a'),
('Hoka One One', 'hoka', 'Maximalist cushioning footwear releases', '#0072ce'),
('On Running', 'on-running', 'CloudTec footwear and apparel launches', '#000000'),
('Dickies 1922', 'dickies', 'Authentic rugged workwear collections', '#b32025'),
('Gramicci', 'gramicci', 'Yosemite climbing and lifestyle apparel', '#9e2a2b'),
('Dr. Martens', 'dr-martens', 'Iconic yellow-stitched boots and shoes', '#ffcc00'),
('707 Vault / Exclusive', '707-vault', 'The 707 Company private archive and VIP drop hub', '#000000')
ON CONFLICT (slug) DO NOTHING;

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
