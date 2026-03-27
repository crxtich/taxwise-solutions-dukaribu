
-- Site settings (key-value store for company info)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site_settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

-- Homepage stats
CREATE TABLE public.stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL,
  label text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read stats" ON public.stats FOR SELECT TO anon, authenticated USING (true);

-- Offices
CREATE TABLE public.offices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  address text,
  po_box text,
  phone text NOT NULL,
  email text NOT NULL,
  map_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read offices" ON public.offices FOR SELECT TO anon, authenticated USING (true);

-- Services
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  details jsonb NOT NULL DEFAULT '[]',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read services" ON public.services FOR SELECT TO anon, authenticated USING (true);

-- Compliance sections
CREATE TABLE public.compliance_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  title text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE public.compliance_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read compliance_sections" ON public.compliance_sections FOR SELECT TO anon, authenticated USING (true);

-- Compliance questions
CREATE TABLE public.compliance_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES public.compliance_sections(id) ON DELETE CASCADE NOT NULL,
  question_number int NOT NULL,
  text text NOT NULL,
  is_reverse_scored boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE public.compliance_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read compliance_questions" ON public.compliance_questions FOR SELECT TO anon, authenticated USING (true);

-- Training topics
CREATE TABLE public.training_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE public.training_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read training_topics" ON public.training_topics FOR SELECT TO anon, authenticated USING (true);

-- Training formats
CREATE TABLE public.training_formats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE public.training_formats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read training_formats" ON public.training_formats FOR SELECT TO anon, authenticated USING (true);

-- Document steps
CREATE TABLE public.document_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE public.document_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read document_steps" ON public.document_steps FOR SELECT TO anon, authenticated USING (true);

-- Document folders
CREATE TABLE public.document_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read document_folders" ON public.document_folders FOR SELECT TO anon, authenticated USING (true);

-- Job types
CREATE TABLE public.job_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE public.job_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read job_types" ON public.job_types FOR SELECT TO anon, authenticated USING (true);

-- Jobs
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client text NOT NULL,
  type text NOT NULL,
  staff text NOT NULL,
  deadline date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read jobs" ON public.jobs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert jobs" ON public.jobs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update jobs" ON public.jobs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete jobs" ON public.jobs FOR DELETE TO anon, authenticated USING (true);

-- Contact submissions
CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert contact_submissions" ON public.contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Seed site_settings
INSERT INTO public.site_settings (key, value) VALUES
  ('company_name', 'Taxwise Solutions'),
  ('company_subtitle', 'Certified Public Accountants'),
  ('tagline', 'Compliance. Clarity. Confidence.'),
  ('registration_number', 'BN-DBC6936'),
  ('email', 'info@taxwisesolutions.co.ke'),
  ('owner', 'Joaquim Musembi Mutua'),
  ('hero_headline', 'Your Trusted Partner in Tax, Compliance & Financial Advisory'),
  ('hero_subheading', 'Serving businesses across Mombasa, Kwale & beyond with expert bookkeeping, audit, tax consultancy, and compliance services.'),
  ('hero_cta_primary', 'Get a Free Compliance Check'),
  ('hero_cta_secondary', 'Our Services'),
  ('about_description', 'Taxwise Solutions is a Kenyan accounting and tax consultancy firm providing professional bookkeeping, audit, tax consultancy, management accounts, statutory compliance, and business strategy services. We serve businesses across Mombasa, Kwale County, and the wider Coast region.'),
  ('po_box', 'P.O. Box 87788, 80100 Mombasa G.P.O.'),
  ('year_established', '2019'),
  ('cta_headline', 'Is Your Business Fully Compliant?'),
  ('cta_description', 'Take our free compliance health check to identify gaps in your statutory filings, tax returns, and regulatory obligations.'),
  ('cta_button_text', 'Start Your Free Check'),
  ('about_section_title', 'Professional Financial Services Since 2019'),
  ('about_section_description', 'Taxwise Solutions provides professional bookkeeping, audit, tax consultancy, management accounts, statutory compliance, and business strategy services. We are registered and trusted by businesses across the Kenyan Coast region.'),
  ('pin_code', '2019');

-- Seed stats
INSERT INTO public.stats (value, label, sort_order) VALUES
  ('6+', 'Years Experience', 0),
  ('200+', 'Clients Served', 1),
  ('2', 'Office Locations', 2),
  ('100%', 'KRA Compliance Rate', 3);

-- Seed offices
INSERT INTO public.offices (name, city, address, po_box, phone, email, map_url, sort_order) VALUES
  ('Mombasa Office', 'Mombasa', '9/2 NSSF Building, Nkrumah Road, Mombasa', 'P.O. Box 87788, 80100 Mombasa G.P.O.', '0720 614530', 'info@taxwisesolutions.co.ke', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3979.844!2d39.6682!3d-4.0435!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwMDInMzYuNiJTIDM5wrA0MCcwNS41IkU!5e0!3m2!1sen!2ske!4v1', 0),
  ('Diani / Kwale Office', 'Kwale', 'Kwale County, Coast Region', NULL, '0799 866441', 'info@taxwisesolutions.co.ke', NULL, 1);

-- Seed services
INSERT INTO public.services (title, description, icon_name, details, sort_order) VALUES
  ('Bookkeeping Services', 'Professional books of accounts for SMEs. We maintain accurate financial records so you can focus on growing your business.', 'BookOpen', '["General ledger maintenance", "Accounts payable & receivable", "Bank reconciliations", "Monthly financial reporting"]', 0),
  ('Financial Statement Audit', 'Independent audits for listed companies, private entities, NGOs, and public sector organizations.', 'FileCheck', '["Statutory audits", "Special purpose audits", "Compliance audits", "Due diligence reviews"]', 1),
  ('Sustainability / ESG Assurance', 'ESG reporting aligned with GRI, IFRS Sustainability, ESRS, and SASB standards.', 'Leaf', '["GRI Standards reporting", "IFRS S1 & S2 alignment", "ESRS compliance", "SASB materiality mapping"]', 2),
  ('Institutional & Donor Audits', 'Specialized audits for NGOs, UN entities, EU-funded projects, and donor-funded programmes.', 'Building2', '["UN agency audits", "EU project verification", "USAID compliance", "Grant financial reporting"]', 3),
  ('Risk Assurance', 'Internal audit, SOX compliance, and governance assurance to protect your organization.', 'Shield', '["Internal audit services", "SOX compliance", "Governance reviews", "Risk assessment frameworks"]', 4),
  ('Corporate Tax Compliance & Planning', 'KRA iTax returns, installment taxes, transfer pricing, R&D incentives, objections & appeals.', 'Receipt', '["Corporate tax returns", "Transfer pricing documentation", "Tax objections & appeals", "R&D tax incentives"]', 5),
  ('Statutory Compliance', 'PAYE, NSSF, SHA, Housing Levy, VAT, TOT, NEMA, county levies — all filed on time.', 'FileText', '["PAYE & payroll taxes", "NSSF & SHA returns", "VAT & Withholding Tax", "County permits & levies"]', 6),
  ('Management Accounts & Business Strategy', 'Strategic plans, financial forecasts, budgets, and financial health reviews.', 'BarChart3', '["Monthly management accounts", "Strategic business plans", "Cash flow forecasting", "Financial health audits"]', 7),
  ('Training & Sensitization', 'Client education on statutory compliance obligations — NSSF, SHA, PAYE, Housing Levy, KRA, and more.', 'GraduationCap', '["Compliance workshops", "Staff training sessions", "KRA filing guidance", "Regulatory update briefings"]', 8);

-- Seed compliance sections & questions
INSERT INTO public.compliance_sections (id, code, title, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'A', 'Section A: Payroll & Statutory Deductions', 0),
  ('a0000000-0000-0000-0000-000000000002', 'B', 'Section B: Taxes & Periodic Filings', 1),
  ('a0000000-0000-0000-0000-000000000003', 'C', 'Section C: County Government Compliance', 2),
  ('a0000000-0000-0000-0000-000000000004', 'D', 'Section D: Regulatory & Environmental', 3),
  ('a0000000-0000-0000-0000-000000000005', 'E', 'Section E: Historical Health', 4),
  ('a0000000-0000-0000-0000-000000000006', 'F', 'Section F: Corporate Legal Filings', 5);

INSERT INTO public.compliance_questions (section_id, question_number, text, is_reverse_scored, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 1, 'Have all PAYE, NSSF, SHA, and Housing Levy returns been filed and paid by the 9th of the following month?', false, 0),
  ('a0000000-0000-0000-0000-000000000001', 2, 'Do statutory deductions in the payroll report match amounts paid on KRA, NSSF, and SHA portals?', false, 1),
  ('a0000000-0000-0000-0000-000000000001', 3, 'Has NITA been filed quarterly (if applicable)?', false, 2),
  ('a0000000-0000-0000-0000-000000000002', 4, 'Was VAT filed by the 20th and reconciled with banked sales and ETR data each month?', false, 3),
  ('a0000000-0000-0000-0000-000000000002', 5, 'Are Installment Tax payments (4th, 6th, 12th month) up to date?', false, 4),
  ('a0000000-0000-0000-0000-000000000002', 6, 'Have TOT, Rental Income Tax, or Digital Service Tax been filed and paid monthly by the 20th (if applicable)?', false, 5),
  ('a0000000-0000-0000-0000-000000000003', 7, 'Is the Single Business Permit valid and displayed?', false, 6),
  ('a0000000-0000-0000-0000-000000000003', 8, 'Have all relevant monthly county levies (e.g. Catering Levy) been filed and paid?', false, 7),
  ('a0000000-0000-0000-0000-000000000004', 9, 'Is the NEMA license current and valid?', false, 8),
  ('a0000000-0000-0000-0000-000000000004', 10, 'Are all sector-specific licenses (Weights & Measures, Food Hygiene, WRA) valid?', false, 9),
  ('a0000000-0000-0000-0000-000000000005', 11, 'Does the "Pending Returns" tab on KRA iTax show zero unfiled returns?', false, 10),
  ('a0000000-0000-0000-0000-000000000005', 12, 'Are there any open audit cases, outstanding debts, or penalties on KRA iTax?', true, 11),
  ('a0000000-0000-0000-0000-000000000005', 13, 'Do NSSF, SHA, and Housing Levy portals show zero balance with no historical arrears?', false, 12),
  ('a0000000-0000-0000-0000-000000000005', 14, 'Is the ETR/TIMS device functional and PIN register updated?', false, 13),
  ('a0000000-0000-0000-0000-000000000006', 15, 'Has the Annual Return been filed with BRS within the last 12 months?', false, 14),
  ('a0000000-0000-0000-0000-000000000006', 16, 'Is the Beneficial Ownership register filed and up to date with BRS?', false, 15);

-- Seed training topics
INSERT INTO public.training_topics (name, sort_order) VALUES
  ('NSSF Registration & Returns', 0),
  ('SHA (Social Health Authority) Compliance', 1),
  ('PAYE Computation & Filing', 2),
  ('Housing Levy Obligations', 3),
  ('KRA iTax Filing & Portal Navigation', 4),
  ('VAT & Withholding Tax', 5),
  ('Catering Levy', 6),
  ('NEMA Licensing Requirements', 7),
  ('Single Business Permit Renewals', 8),
  ('ETR/TIMS Device Compliance', 9),
  ('BRS Annual Returns & Beneficial Ownership', 10),
  ('County Government Levies', 11);

-- Seed training formats
INSERT INTO public.training_formats (title, description, sort_order) VALUES
  ('On-Site Workshops', 'We visit your premises to train your accounts and admin team on compliance procedures and portal navigation.', 0),
  ('Virtual Sessions', 'Remote training via Zoom or Google Meet for distributed teams or multi-branch businesses.', 1),
  ('One-on-One Coaching', 'Personalized sessions for business owners and managers who want hands-on guidance with KRA, NSSF, and SHA portals.', 2),
  ('Compliance Update Briefings', 'Stay current with regulatory changes through our periodic compliance update sessions.', 3);

-- Seed document steps
INSERT INTO public.document_steps (title, description, icon_name, sort_order) VALUES
  ('We Create Your Folder', 'A dedicated Google Drive folder is set up with organized subfolders for your business.', 'FolderOpen', 0),
  ('Upload Your Documents', 'Upload invoices, receipts, payroll records, and tax returns securely to your folder.', 'Upload', 1),
  ('We Process & File', 'Our team accesses your documents to prepare books, file returns, and manage compliance.', 'FileText', 2),
  ('Secure & Organized', 'All files are stored securely with proper access controls and organized filing.', 'Shield', 3);

-- Seed document folders
INSERT INTO public.document_folders (name, sort_order) VALUES
  ('Invoices', 0),
  ('Receipts', 1),
  ('Payroll Records', 2),
  ('Tax Returns', 3),
  ('Bank Statements', 4),
  ('Contracts & Agreements', 5);

-- Seed job types
INSERT INTO public.job_types (name, sort_order) VALUES
  ('Bookkeeping', 0),
  ('Audit', 1),
  ('Tax Returns', 2),
  ('Statutory Compliance', 3),
  ('Management Accounts', 4),
  ('Training', 5),
  ('Donor Audit', 6),
  ('ESG Assurance', 7),
  ('Other', 8);
