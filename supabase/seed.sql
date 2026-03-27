-- =============================================================
-- Taxwise Solutions — Supabase Seed Data (canonical, safe to re-run)
-- =============================================================

-- ─── SITE SETTINGS ───────────────────────────────────────────
DELETE FROM public.site_settings;
INSERT INTO public.site_settings (key, value) VALUES
  ('company_name',         'Taxwise Solutions'),
  ('company_subtitle',     'Certified Public Accountants & Tax Consultants'),
  ('year_established',     '2019'),
  ('hero_headline',        'Your Trusted Partner in Tax, Compliance & Financial Advisory'),
  ('hero_subheading',      'Serving businesses across Mombasa, Kwale & beyond'),
  ('hero_cta_primary',     'Get a Free Compliance Check'),
  ('hero_cta_secondary',   'Our Services'),
  ('tagline',              'Compliance. Clarity. Confidence.'),
  ('po_box',               'P.O. Box 87788, 80100 - Mombasa G.P.O.'),
  ('pin_code',             '2019'),
  ('about_section_title',  'Who We Are'),
  ('about_description',    'Taxwise Solutions is a registered consultancy firm providing professional bookkeeping, audit, tax advisory, and statutory compliance services to businesses across the Kenyan coast. Founded in Mombasa, we serve SMEs, NGOs, and corporates across Mombasa and Kwale counties.'),
  ('registration_number',  'BN-DBC6936'),  -- internal record only, never rendered on frontend
  ('cta_headline',         'Not Sure If Your Business Is Compliant?'),
  ('cta_description',      'Take our free compliance health check and find out in minutes.'),
  ('cta_button_text',      'Start Your Free Check');

-- ─── STATS ───────────────────────────────────────────────────
DELETE FROM public.stats;
INSERT INTO public.stats (sort_order, value, label) VALUES
  (1, '2019',  'Established'),
  (2, '2',     'Office Locations'),
  (3, '100+',  'Clients Served'),
  (4, '99%',   'Compliance Rate');

-- ─── OFFICES ─────────────────────────────────────────────────
DELETE FROM public.offices;
INSERT INTO public.offices (sort_order, name, city, address, po_box, phone, email) VALUES
  (1, 'Mombasa Office',    'Mombasa', '9/2 NSSF Building, Nkrumah Road, Mombasa', 'P.O. Box 87788, 80100 - Mombasa G.P.O.', '0720 614530', 'info@taxwisesolutions.co.ke'),
  (2, 'Kwale/Diani Office','Kwale',   'Diani, Kwale County',                        'P.O. Box 87788, 80100 - Mombasa G.P.O.', '0799 866441', 'info@taxwisesolutions.co.ke');

-- ─── SERVICES ────────────────────────────────────────────────
DELETE FROM public.services;
INSERT INTO public.services (sort_order, title, description, icon_name, details) VALUES
  (1, 'Bookkeeping Services',              'Professional, accurate books for SMEs and growing businesses.',                        'BookOpen',     '["Monthly bookkeeping and ledger management","Bank reconciliations","Accounts payable and receivable","Management reports"]'),
  (2, 'Financial Statement Audit',         'Independent audits that build confidence and trust with stakeholders.',                'FileCheck',    '["Statutory audits for private and listed companies","NGO and donor audits","Group consolidation audits","IFRS-compliant reporting"]'),
  (3, 'Sustainability & ESG Assurance',    'Transparent, reliable ESG and sustainability reporting assurance.',                   'Leaf',         '["GRI, IFRS, ESRS, SASB frameworks","Sustainability disclosures","ESG risk assessments","Regulatory compliance support"]'),
  (4, 'Institutional & Donor Audits',      'Specialist audits for NGOs, UN entities and EU-funded projects.',                    'Building2',    '["Grant compliance audits","Field and headquarters audits","Donor reporting support","EU and USAID project audits"]'),
  (5, 'Risk Assurance',                    'Robust governance, risk management and internal controls.',                          'Shield',       '["Internal audit services","SOX and COSO compliance","Governance assurance","Compliance monitoring"]'),
  (6, 'Corporate Tax Compliance & Planning','End-to-end corporate tax services for Kenyan businesses.',                         'Receipt',      '["KRA iTax return preparation","Installment tax management","Transfer pricing documentation","Tax authority objections and appeals"]'),
  (7, 'Statutory Compliance',              'Full management of your statutory filing obligations.',                              'FileText',     '["PAYE, NSSF, SHA, Housing Levy filing","VAT returns by the 20th","Turnover Tax (TOT) and Digital Service Tax","County levies and NEMA compliance"]'),
  (8, 'Management Accounts & Strategy',   'Financial insights and strategic plans to grow your business.',                      'BarChart3',    '["Monthly management accounts","Cash flow forecasting","Business strategic plans","Financial health reviews"]'),
  (9, 'Training & Sensitization',          'Compliance training packages for your team.',                                        'GraduationCap','["PAYE, NSSF, SHA and Housing Levy workshops","KRA iTax portal training","ETR/TIMS device usage","County and sector compliance"]');

-- ─── COMPLIANCE ───────────────────────────────────────────────
DELETE FROM public.compliance_questions;
DELETE FROM public.compliance_sections;
INSERT INTO public.compliance_sections (id, code, title, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'A', 'Payroll & Statutory Deductions',            1),
  ('a0000000-0000-0000-0000-000000000002', 'B', 'Taxes & Periodic Filings',                  2),
  ('a0000000-0000-0000-0000-000000000003', 'C', 'County Government Compliance',              3),
  ('a0000000-0000-0000-0000-000000000004', 'D', 'Regulatory & Environmental Compliance',     4),
  ('a0000000-0000-0000-0000-000000000005', 'E', 'Historical Health (Audits & Arrears)',      5),
  ('a0000000-0000-0000-0000-000000000006', 'F', 'Corporate Legal Filings',                   6);

INSERT INTO public.compliance_questions (section_id, question_number, text, is_reverse_scored, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 1,  'Have all PAYE, NSSF, SHA, and Housing Levy returns been filed and paid by the 9th of the following month for the review period?', false, 1),
  ('a0000000-0000-0000-0000-000000000001', 2,  'Do the total statutory deductions in the payroll report exactly match the amounts paid and declared on the KRA, NSSF, and SHA portals?', false, 2),
  ('a0000000-0000-0000-0000-000000000001', 3,  'Has NITA been filed quarterly (if applicable)?', false, 3),
  ('a0000000-0000-0000-0000-000000000002', 4,  'For every month in the review period, was VAT filed by the 20th and reconciled with banked sales and ETR data?', false, 4),
  ('a0000000-0000-0000-0000-000000000002', 5,  'Are all Installment Tax payments (4th, 6th, 12th month) up to date to avoid interest?', false, 5),
  ('a0000000-0000-0000-0000-000000000002', 6,  'Have Turnover Tax (TOT), Rental Income Tax, or Digital Service Tax been filed and paid monthly by the 20th (if applicable)?', false, 6),
  ('a0000000-0000-0000-0000-000000000003', 7,  'Is the Single Business Permit valid and displayed?', false, 7),
  ('a0000000-0000-0000-0000-000000000003', 8,  'Have all relevant monthly county levies (e.g. Catering Levy) been filed and paid?', false, 8),
  ('a0000000-0000-0000-0000-000000000004', 9,  'Is the NEMA license current and valid?', false, 9),
  ('a0000000-0000-0000-0000-000000000004', 10, 'Are all other sector-specific licenses (Weights & Measures, Food Hygiene, WRA) valid?', false, 10),
  ('a0000000-0000-0000-0000-000000000005', 11, 'Does the Pending Returns tab on KRA iTax show zero unfiled returns (including nil returns)?', false, 11),
  ('a0000000-0000-0000-0000-000000000005', 12, 'Are there any open audit cases, outstanding principal debts, or penalties on the KRA iTax ledger?', true, 12),
  ('a0000000-0000-0000-0000-000000000005', 13, 'Do the NSSF, SHA, and Housing Levy portals show a zero balance with no historical arrears?', false, 13),
  ('a0000000-0000-0000-0000-000000000005', 14, 'Is the ETR/TIMS device functional and has the PIN register been updated recently?', false, 14),
  ('a0000000-0000-0000-0000-000000000006', 15, 'Has the Annual Return been filed with the Business Registration Service (BRS) within the last 12 months?', false, 15),
  ('a0000000-0000-0000-0000-000000000006', 16, 'Is the Beneficial Ownership register filed and up to date with BRS?', false, 16);

-- ─── TRAINING ─────────────────────────────────────────────────
DELETE FROM public.training_topics;
INSERT INTO public.training_topics (sort_order, name) VALUES
  (1, 'PAYE (Pay As You Earn)'),
  (2, 'NSSF Contributions'),
  (3, 'SHA (Social Health Authority)'),
  (4, 'Housing Levy'),
  (5, 'VAT Filing & ETR/TIMS'),
  (6, 'Turnover Tax (TOT)'),
  (7, 'Catering Levy'),
  (8, 'NEMA Compliance'),
  (9, 'KRA iTax Portal Navigation'),
  (10, 'Annual Returns & BRS Filings');

DELETE FROM public.training_formats;
INSERT INTO public.training_formats (sort_order, title, description) VALUES
  (1, 'On-Site Workshops',    'We come to your premises and train your team in a full or half-day session tailored to your business.'),
  (2, 'Virtual Sessions',     'Live online training via Zoom or Google Meet — ideal for distributed teams or busy schedules.'),
  (3, 'Periodic Refreshers',  'Quarterly or annual refresher sessions to keep your team up to date with regulatory changes.');

-- ─── DOCUMENT MANAGEMENT ──────────────────────────────────────
DELETE FROM public.document_steps;
INSERT INTO public.document_steps (sort_order, title, description, icon_name) VALUES
  (1, 'Onboarding',           'We set up a dedicated Google Drive folder structure for your business.', 'FolderOpen'),
  (2, 'Upload Documents',     'You upload invoices, receipts, payroll, and statements to your folder.', 'Upload'),
  (3, 'We Organise & Review', 'Our team reviews, categorises, and flags any missing documents.',       'FileCheck'),
  (4, 'Reports & Filing',     'We use the organised documents to file returns and prepare financial reports.', 'BarChart3');

DELETE FROM public.document_folders;
INSERT INTO public.document_folders (sort_order, name) VALUES
  (1, 'Invoices'), (2, 'Receipts'), (3, 'Payroll Records'),
  (4, 'Tax Returns'), (5, 'Bank Statements'), (6, 'Contracts'),
  (7, 'Permits & Licenses'), (8, 'Audit Reports'), (9, 'Management Accounts');

-- ─── JOB TYPES ───────────────────────────────────────────────
DELETE FROM public.job_types;
INSERT INTO public.job_types (sort_order, name) VALUES
  (1, 'Bookkeeping'), (2, 'Audit'), (3, 'Tax Return Filing'),
  (4, 'Payroll Processing'), (5, 'Management Accounts'),
  (6, 'Compliance Review'), (7, 'Training Session'), (8, 'Strategic Plan');

-- ─── ADMIN USERS TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
