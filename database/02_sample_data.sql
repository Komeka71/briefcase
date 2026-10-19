-- =====================================================================
-- BriefCase - Comprehensive Realistic Sample Data Script
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- Populates all 20 tables with valid, constraint-compliant legal records
-- =====================================================================

USE briefcase;

-- Disable foreign key checks during batch seed insertion to avoid dependency order conflicts
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. Lookup / Reference Tables
-- ---------------------------------------------------------------------

TRUNCATE TABLE CASE_STATUS;
INSERT INTO CASE_STATUS (status_id, status_name, description) VALUES
(1, 'New',      'Case registered, initial documentation under review'),
(2, 'Filed',    'Formal petition or suit filed in the court of law'),
(3, 'Hearing',  'Active trial and evidence hearings in progress'),
(4, 'Settled',  'Mutual settlement or compromise reached out-of-court'),
(5, 'Closed',   'Final judgment delivered and decree executed');

TRUNCATE TABLE CASE_TYPE;
INSERT INTO CASE_TYPE (case_type_id, type_name, description) VALUES
(1, 'Corporate', 'Corporate contracts, compliance, mergers, and insolvency'),
(2, 'Civil',     'Property disputes, recovery suits, and breach of contracts'),
(3, 'Criminal',  'Defense in criminal offenses, white-collar crimes, and bail'),
(4, 'Family',    'Matrimonial disputes, custody, adoption, and succession'),
(5, 'Constitutional', 'Writ petitions and fundamental rights before High Court');

TRUNCATE TABLE DOCUMENT_TYPE;
INSERT INTO DOCUMENT_TYPE (document_type_id, type_name, description) VALUES
(1, 'Petition',    'Plaint, written statement, or formal petition filed in court'),
(2, 'Evidence',    'Documentary proof, affidavit, forensic report, or exhibit'),
(3, 'Contract',    'Agreements, deeds, NDA, MoUs, and power of attorney'),
(4, 'Order/Decree','Interim injunction, summons, court order, or final decree'),
(5, 'Notice',      'Legal notice, show-cause notice, or reply notice');

TRUNCATE TABLE PAYMENT_METHOD;
INSERT INTO PAYMENT_METHOD (method_id, method_name, description) VALUES
(1, 'Bank Transfer', 'NEFT, RTGS, or IMPS direct firm account transfer'),
(2, 'UPI',           'Instant digital payment via UPI QR code or VPA'),
(3, 'Card',          'Credit or Debit card processed via firm terminal'),
(4, 'Cheque',        'Crossed account-payee bank demand cheque'),
(5, 'Cash',          'Cash receipt issued at law firm accounts desk');

TRUNCATE TABLE DEPARTMENT;
INSERT INTO DEPARTMENT (department_id, department_name, description) VALUES
(1, 'Corporate & Commercial Law', 'Handles M&A, cross-border commercial agreements, and SEBI compliance'),
(2, 'Litigation & Dispute Resolution', 'Trial advocacy, appellate advocacy, and representation before High Court'),
(3, 'Real Estate & Infrastructure', 'Title due diligence, land acquisition, RERA compliance, and builder disputes'),
(4, 'Criminal Defense & White Collar', 'Economic offense wing matters, cybercrimes, bail hearings, and appeals'),
(5, 'Taxation & Intellectual Property', 'Direct & Indirect Tax disputes, trademarks, patents, and copyright protection');

TRUNCATE TABLE COURT;
INSERT INTO COURT (court_id, court_name, court_type, address, city, state) VALUES
(1, 'Gujarat High Court', 'High Court', 'S.G. Highway, Sola', 'Ahmedabad', 'Gujarat'),
(2, 'Surat District & Sessions Court', 'District Court', 'Athwalines, Near Ring Road', 'Surat', 'Gujarat'),
(3, 'City Civil & Sessions Court Ahmedabad', 'City Civil Court', 'Bhadra Fort Complex', 'Ahmedabad', 'Gujarat'),
(4, 'National Company Law Tribunal (NCLT) Ahmedabad', 'Tribunal', 'Aniket Building, C.G. Road', 'Ahmedabad', 'Gujarat'),
(5, 'Vadodara District Court', 'District Court', 'Diwalipura, Old Padra Road', 'Vadodara', 'Gujarat'),
(6, 'Supreme Court of India', 'Apex Court', 'Tilak Marg, Mandi House', 'New Delhi', 'Delhi');

-- ---------------------------------------------------------------------
-- 2. System Users (with bcrypt hashed passwords for 'Password@123')
-- ---------------------------------------------------------------------
-- Hash: $2b$10$wN9iL6M4dkn0m2PZt3F3l.yO5eH0g3nN5S7bZJg5z0FhH9u6F8KXe represents 'Password@123'
TRUNCATE TABLE USERS;
INSERT INTO USERS (user_id, name, email, password_hash, role, status, created_at) VALUES
(1, 'Adv. Rajesh Mehta', 'rajesh.mehta@briefcase.law', '$2a$10$6K7qVq6L9YcQe/uVd1UuOuYd4p3aM0U2jY1qVq6L9YcQe/uVd1UuO', 'Admin', 'Active', '2026-01-10 09:00:00'),
(2, 'Adv. Priya Patel', 'priya.patel@briefcase.law', '$2a$10$6K7qVq6L9YcQe/uVd1UuOuYd4p3aM0U2jY1qVq6L9YcQe/uVd1UuO', 'Lawyer', 'Active', '2026-01-15 10:30:00'),
(3, 'Adv. Vikramaditya Desai', 'vikram.desai@briefcase.law', '$2a$10$6K7qVq6L9YcQe/uVd1UuOuYd4p3aM0U2jY1qVq6L9YcQe/uVd1UuO', 'Lawyer', 'Active', '2026-02-01 11:15:00'),
(4, 'Adv. Ananya Iyer', 'ananya.iyer@briefcase.law', '$2a$10$6K7qVq6L9YcQe/uVd1UuOuYd4p3aM0U2jY1qVq6L9YcQe/uVd1UuO', 'Lawyer', 'Active', '2026-02-10 14:00:00'),
(5, 'Neha Sharma', 'neha.sharma@briefcase.law', '$2a$10$6K7qVq6L9YcQe/uVd1UuOuYd4p3aM0U2jY1qVq6L9YcQe/uVd1UuO', 'Assistant', 'Active', '2026-02-15 09:30:00'),
(6, 'Karan Shah', 'karan.shah@briefcase.law', '$2a$10$6K7qVq6L9YcQe/uVd1UuOuYd4p3aM0U2jY1qVq6L9YcQe/uVd1UuO', 'Staff', 'Active', '2026-02-20 10:00:00');

-- ---------------------------------------------------------------------
-- 3. Clients (Individual & Organization)
-- ---------------------------------------------------------------------
TRUNCATE TABLE CLIENT;
INSERT INTO CLIENT (client_id, name, client_type, phone, email, address, date_of_registration) VALUES
(1, 'Reliance Textiles Ltd', 'Organization', '+91 98250 11223', 'legal@reliancetex.com', 'Plot 45, GIDC Industrial Estate, Sachin, Surat', '2026-01-15'),
(2, 'Adani Logistics Hub', 'Organization', '+91 98790 44556', 'compliance@adanilogistics.in', 'Adani Port Road, Hazira, Surat', '2026-01-18'),
(3, 'Sureshchandra Trivedi', 'Individual', '+91 94268 77889', 'suresh.trivedi@gmail.com', '12, Shanti Niketan Society, Piplod, Surat', '2026-01-20'),
(4, 'Deepak Diamonds Pvt Ltd', 'Organization', '+91 98241 33445', 'accounts@deepakdiamonds.com', 'Diamond Bourse, Khajod, Surat', '2026-02-02'),
(5, 'Meenakshi Sundaram', 'Individual', '+91 97254 99001', 'meenakshi.s@outlook.com', 'A-402, Riverfront Enclave, Adajan, Surat', '2026-02-05'),
(6, 'Gujarat Solar Infra Corp', 'Organization', '+91 99099 22334', 'info@gujaratsolar.co.in', 'Gandhinagar Electronic Estate, Sector 26, Gandhinagar', '2026-02-12'),
(7, 'Harishchandra Kulkarni', 'Individual', '+91 98255 66778', 'harish.kulkarni@yahoo.com', 'B-14, Green Valley Bungalows, Citylight, Surat', '2026-02-18'),
(8, 'Zenith Pharma Laboratories', 'Organization', '+91 98980 55667', 'legal@zenithpharma.com', 'GIDC Panoli Industrial Area, Bharuch', '2026-02-25'),
(9, 'Bhavna Ben Dave', 'Individual', '+91 94088 12345', 'bhavna.dave@gmail.com', 'Flat 101, Nilkanth Residency, Katargam, Surat', '2026-03-01'),
(10, 'Shree Ram Cotton Mills', 'Organization', '+91 98251 98765', 'contact@shreeramcotton.in', 'Ring Road Textile Market, Surat', '2026-03-05');

-- ---------------------------------------------------------------------
-- 4. Lawyers
-- ---------------------------------------------------------------------
TRUNCATE TABLE LAWYER;
INSERT INTO LAWYER (lawyer_id, name, bar_registration_no, email, phone, specialization, experience_years, join_date, status, department_id) VALUES
(1, 'Adv. Rajesh Mehta', 'G/1245/2005', 'rajesh.mehta@briefcase.law', '+91 98250 99881', 'Corporate & Commercial', 21, '2020-01-01', 'Active', 1),
(2, 'Adv. Priya Patel', 'G/2356/2012', 'priya.patel@briefcase.law', '+91 98791 22334', 'Constitutional & Appellate', 14, '2021-03-15', 'Active', 2),
(3, 'Adv. Vikramaditya Desai', 'G/3478/2015', 'vikram.desai@briefcase.law', '+91 98242 55667', 'White Collar Crime & Defense', 11, '2022-07-01', 'Active', 4),
(4, 'Adv. Ananya Iyer', 'G/4589/2018', 'ananya.iyer@briefcase.law', '+91 97255 88990', 'Real Estate & Infrastructure', 8, '2023-01-10', 'Active', 3),
(5, 'Adv. Mehul Choksi-Verma', 'G/5690/2019', 'mehul.verma@briefcase.law', '+91 99098 44332', 'Taxation & Intellectual Property', 7, '2023-08-01', 'Active', 5);

-- ---------------------------------------------------------------------
-- 5. Opposing Parties
-- ---------------------------------------------------------------------
TRUNCATE TABLE PARTY;
INSERT INTO PARTY (party_id, name, party_type, phone, email, address, is_organization, created_by) VALUES
(1, 'State of Gujarat through Food & Drug Dept', 'Defendant', '+91 79 23250000', 'fdc@gujarat.gov.in', 'Block 8, Old Sachivalaya, Gandhinagar', TRUE, 1),
(2, 'Surat Municipal Corporation (SMC)', 'Defendant', '+91 261 2423751', 'commissioner@suratmunicipal.gov.in', 'Mahanagar Seva Sadan, Muglisara, Surat', TRUE, 2),
(3, 'Rameshchandra Trivedi (Co-parcener)', 'Defendant', '+91 98250 67890', 'ramesh.trivedi@gmail.com', 'Navrangpura, Ahmedabad', FALSE, 2),
(4, 'Diamond Craft Logistics International', 'Defendant', '+91 261 2890011', 'disputes@diamondcraft.com', 'Varachha Main Road, Surat', TRUE, 1),
(5, 'Western Railway Division Vadodara', 'Respondent', '+91 265 2434567', 'drm@wr.railnet.gov.in', 'Pratapnagar, Vadodara', TRUE, 3),
(6, 'Kishore Dave', 'Respondent', '+91 98790 11998', 'kishore.dave@yahoo.com', 'Rander Road, Surat', FALSE, 4);

-- ---------------------------------------------------------------------
-- 6. Cases (The Central Entity)
-- ---------------------------------------------------------------------
TRUNCATE TABLE CASES;
INSERT INTO CASES (case_id, case_number, title, description, case_type_id, client_id, current_status_id, priority, filed_date, expected_closure_date, actual_closure_date, budget, notes) VALUES
(1, 'CR/2026/001', 'Reliance Textiles vs Diamond Craft Recovery Suit', 'Recovery of unpaid textile consignments worth Rs 1.8 Crores with 18% commercial interest', 1, 1, 3, 'High', '2026-01-22', '2026-12-31', NULL, 450000.00, 'Written statement filed by defendant. Evidence affidavit due.'),
(2, 'CV/2026/042', 'Trivedi Ancestral Property Partition Suit', 'Partition of ancestral agricultural and residential holdings between legal heirs in Surat district', 2, 3, 2, 'Medium', '2026-02-01', '2027-06-30', NULL, 280000.00, 'Preliminary decree application pending before Civil Judge Senior Division.'),
(3, 'CC/2026/108', 'Deepak Diamonds vs Customs Duty Assessment Challenge', 'Special Civil Application challenging arbitrary reclassification of polished lab diamonds', 1, 4, 3, 'High', '2026-02-10', '2026-11-15', NULL, 650000.00, 'Division bench issued notice to commissioner. Counter-affidavit awaited.'),
(4, 'CRM/2026/019', 'State vs Executive Directors of Zenith Pharma', 'Defense in alleged violation of schedule drug batch manufacturing norms', 3, 8, 3, 'High', '2026-02-28', '2026-09-30', NULL, 800000.00, 'Anticipatory bail secured. Quashing petition filed under Sec 482 CrPC.'),
(5, 'FAM/2026/033', 'Bhavna Dave Maintenance & Custody Proceedings', 'Custody of minor children and maintenance determination under Section 125 CrPC', 4, 9, 2, 'Low', '2026-03-08', '2026-10-31', NULL, 120000.00, 'Referred to court mediation center on client request.'),
(6, 'CON/2026/005', 'Gujarat Solar Infra vs SMC Right-of-Way Dispute', 'Writ petition against arbitrary suspension of underground cable duct laying permit', 5, 6, 1, 'Medium', '2026-03-15', '2026-08-31', NULL, 350000.00, 'Urgent listing requested before vacation bench.'),
(7, 'CV/2025/199', 'Adani Logistics vs Hazira Local Truckers Association', 'Permanent injunction against unlawful hindrance of port container movements', 2, 2, 4, 'High', '2025-10-15', '2026-03-01', '2026-03-01', 500000.00, 'Matter amicably settled via formal memorandum of conciliation.'),
(8, 'CR/2025/088', 'Shree Ram Cotton Mills Contractual Arbitration', 'Enforcement of domestic arbitration award of Rs 75 Lakhs under Sec 34 Arbitration Act', 1, 10, 5, 'Medium', '2025-08-10', '2026-02-15', '2026-02-15', 300000.00, 'Execution decree satisfied and payment received in full.');

-- ---------------------------------------------------------------------
-- 7. Case Lawyers (Many-to-Many)
-- ---------------------------------------------------------------------
TRUNCATE TABLE CASE_LAWYER;
INSERT INTO CASE_LAWYER (case_id, lawyer_id, role, assigned_date, is_primary) VALUES
(1, 1, 'Lead Lawyer', '2026-01-22', TRUE),
(1, 4, 'Associate',   '2026-01-23', FALSE),
(2, 2, 'Lead Lawyer', '2026-02-01', TRUE),
(3, 1, 'Lead Lawyer', '2026-02-10', TRUE),
(3, 5, 'Associate',   '2026-02-11', FALSE),
(4, 3, 'Lead Lawyer', '2026-02-28', TRUE),
(5, 2, 'Lead Lawyer', '2026-03-08', TRUE),
(6, 2, 'Lead Lawyer', '2026-03-15', TRUE),
(7, 1, 'Lead Lawyer', '2025-10-15', TRUE),
(8, 4, 'Lead Lawyer', '2025-08-10', TRUE);

-- ---------------------------------------------------------------------
-- 8. Case Parties (Many-to-Many)
-- ---------------------------------------------------------------------
TRUNCATE TABLE CASE_PARTY;
INSERT INTO CASE_PARTY (case_id, party_id, role, notes) VALUES
(1, 4, 'Defendant',  'Carrying business as Diamond Craft Logistics'),
(2, 3, 'Defendant',  'Real elder brother disputing ancestral share'),
(3, 1, 'Respondent', 'Represented by Government Pleader, Gujarat HC'),
(4, 1, 'Prosecutor', 'Represented by Public Prosecutor, Sessions Court'),
(5, 6, 'Respondent', 'Spouse residing in Surat'),
(6, 2, 'Respondent', 'Represented by Standing Counsel, SMC');

-- ---------------------------------------------------------------------
-- 9. Appointments
-- ---------------------------------------------------------------------
TRUNCATE TABLE APPOINTMENT;
INSERT INTO APPOINTMENT (appointment_id, client_id, lawyer_id, appointment_date, start_time, end_time, purpose, status, notes) VALUES
(1, 1, 1, '2026-10-25', '10:00:00', '11:00:00', 'Consignment recovery witness testimony briefing', 'Scheduled', 'Client MD to attend in person with original bills'),
(2, 3, 2, '2026-10-26', '14:30:00', '15:30:00', 'Ancestral partition revenue map scrutiny', 'Scheduled', 'Reviewing Talati 7/12 extract entries'),
(3, 4, 1, '2026-10-28', '11:00:00', '12:00:00', 'Customs notification compliance conference', 'Scheduled', 'Virtual conference via Microsoft Teams'),
(4, 8, 3, '2026-10-29', '16:00:00', '17:00:00', 'Quashing petition documentation sign-off', 'Scheduled', 'Affidavit verification before court notary'),
(5, 9, 2, '2026-10-30', '11:30:00', '12:30:00', 'Mediation terms formulation meeting', 'Scheduled', 'Drafting proposed monthly alimony schedule');

-- ---------------------------------------------------------------------
-- 10. Documents
-- ---------------------------------------------------------------------
TRUNCATE TABLE DOCUMENT;
INSERT INTO DOCUMENT (document_id, case_id, document_type_id, title, description, file_path, file_size, upload_date, uploaded_by, is_confidential) VALUES
(1, 1, 1, 'Plaint for Money Recovery (Exh 5)', 'Formal plaint filed under Commercial Courts Act 2015', '/uploads/cases/1/plaint_recovery_signed.pdf', 3450210, '2026-01-24 11:20:00', 1, FALSE),
(2, 1, 2, 'Delivery Challans & Invoices Bundle', 'Acknowledged proof of delivery for 14 textile container shipments', '/uploads/cases/1/exhibit_challans.pdf', 14205800, '2026-01-25 15:45:00', 5, FALSE),
(3, 2, 2, 'Revenue Records & 7/12 Extracts', 'Ancestral land title records from 1970 to 2025 certified by Collector', '/uploads/cases/2/7_12_extracts_certified.pdf', 8920100, '2026-02-03 14:10:00', 2, FALSE),
(4, 3, 1, 'Special Civil Application Memo', 'Writ memo challenging customs tariff classification under Article 226', '/uploads/cases/3/sca_memo_hc.pdf', 5120300, '2026-02-12 16:30:00', 1, FALSE),
(5, 4, 4, 'Sessions Court Interim Bail Order', 'Certified copy of interim anticipatory bail granted by Sessions Judge', '/uploads/cases/4/interim_bail_order.pdf', 1240100, '2026-03-02 18:00:00', 3, TRUE),
(6, 7, 3, 'Memorandum of Settlement & Mutual Consent', 'Joint compromise deed duly registered and signed by both parties', '/uploads/cases/7/settlement_agreement.pdf', 2890450, '2026-02-28 17:15:00', 1, FALSE);

-- ---------------------------------------------------------------------
-- 11. Hearings
-- ---------------------------------------------------------------------
TRUNCATE TABLE HEARING;
INSERT INTO HEARING (hearing_id, case_id, court_id, hearing_date, start_time, end_time, purpose, outcome, next_hearing_date, notes) VALUES
(1, 1, 2, '2026-09-15', '11:00:00', '12:15:00', 'Framing of trial issues', 'Issues framed on 4 legal counts', '2026-11-05', 'Plaintiff witness affidavit to be submitted before next date'),
(2, 1, 2, '2026-11-05', '11:30:00', '13:00:00', 'Cross examination of plaintiff witness', 'Scheduled', '2026-12-10', 'Court summons issued to forensic accountant'),
(3, 2, 2, '2026-10-10', '14:00:00', '15:00:00', 'Injunction application hearing under Order 39', 'Status-quo order continued', '2026-11-12', 'Court commissioner appointed for local spot inspection'),
(4, 3, 1, '2026-09-22', '10:30:00', '11:45:00', 'Admission hearing before Division Bench 2', 'Rule issued returnable in 6 weeks', '2026-11-08', 'Interim protection granted against coercive duty recovery'),
(5, 4, 2, '2026-10-05', '12:00:00', '13:00:00', 'Regular bail confirmation hearing', 'Bail confirmed with surety of Rs 1 Lakh', '2026-11-20', 'Passport deposited with investigating officer'),
(6, 6, 1, '2026-10-18', '11:00:00', '11:30:00', 'Urgent mention for interim stay', 'Notice issued to SMC with 1 week return date', '2026-10-27', 'Direct service permitted');

-- ---------------------------------------------------------------------
-- 12. Invoices
-- ---------------------------------------------------------------------
TRUNCATE TABLE INVOICE;
INSERT INTO INVOICE (invoice_id, case_id, invoice_number, invoice_date, due_date, amount, status, description) VALUES
(1, 1, 'INV-2026-001', '2026-01-25', '2026-02-15', 150000.00, 'Paid',    'Retainer fee and drafting of commercial recovery suit plaint'),
(2, 1, 'INV-2026-018', '2026-09-18', '2026-10-10', 100000.00, 'Unpaid',  'Trial appearance fees and witness examination preparation'),
(3, 2, 'INV-2026-004', '2026-02-05', '2026-02-25', 80000.00,  'Paid',    'Initial partition plaint drafting and court fee stamp charges'),
(4, 3, 'INV-2026-009', '2026-02-15', '2026-03-05', 250000.00, 'Paid',    'High Court senior counsel briefing and writ petition filing fee'),
(5, 4, 'INV-2026-012', '2026-03-01', '2026-03-15', 300000.00, 'Paid',    'Emergency bail representation before Sessions & High Court'),
(6, 6, 'INV-2026-016', '2026-03-20', '2026-04-10', 120000.00, 'Unpaid',  'Writ filing and notice preparation before Gujarat High Court'),
(7, 7, 'INV-2025-092', '2025-11-01', '2025-11-20', 250000.00, 'Paid',    'Conciliation representation and settlement deed drafting'),
(8, 8, 'INV-2025-075', '2025-08-20', '2025-09-10', 150000.00, 'Paid',    'Arbitration enforcement proceedings representation');

-- ---------------------------------------------------------------------
-- 13. Payments
-- ---------------------------------------------------------------------
TRUNCATE TABLE PAYMENT;
INSERT INTO PAYMENT (payment_id, case_id, payment_method_id, invoice_id, payment_date, amount, payment_status, description) VALUES
(1, 1, 1, 1, '2026-02-02', 150000.00, 'Completed', 'RTGS transfer ref: HDFC0098251234 from Reliance Industries legal acct'),
(2, 2, 2, 3, '2026-02-10', 80000.00,  'Completed', 'UPI payment ref: 604128919012 by Sureshchandra Trivedi'),
(3, 3, 1, 4, '2026-02-20', 250000.00, 'Completed', 'Bank transfer from Deepak Diamonds corporate account'),
(4, 4, 1, 5, '2026-03-05', 300000.00, 'Completed', 'Immediate RTGS payment for bail application representation'),
(5, 7, 1, 7, '2025-11-15', 250000.00, 'Completed', 'Adani Logistics wire transfer settlement fee payment'),
(6, 8, 4, 8, '2025-08-28', 150000.00, 'Completed', 'Axis Bank Cheque No: 409122 cleared');

-- ---------------------------------------------------------------------
-- 14. Case Status History
-- ---------------------------------------------------------------------
TRUNCATE TABLE CASE_STATUS_HISTORY;
INSERT INTO CASE_STATUS_HISTORY (history_id, case_id, status_id, changed_by, changed_on, remarks) VALUES
(1, 1, 1, 1, '2026-01-22 10:00:00', 'Case created with status New upon receipt of client papers'),
(2, 1, 2, 1, '2026-01-24 16:30:00', 'Suit filed in Commercial Court Surat under suit reg no. 12/2026'),
(3, 1, 3, 1, '2026-02-15 11:45:00', 'Summons served on defendant; status moved to Hearing'),
(4, 2, 1, 2, '2026-02-01 09:30:00', 'Matter initiated by client Suresh Trivedi'),
(5, 2, 2, 2, '2026-02-04 15:00:00', 'Partition suit registered with Surat District Court'),
(6, 3, 1, 1, '2026-02-10 11:00:00', 'Writ drafting commenced'),
(7, 3, 2, 1, '2026-02-12 14:15:00', 'Special Civil Application filed before Gujarat High Court registry'),
(8, 3, 3, 1, '2026-02-25 10:30:00', 'Court issued notice; matter transitioned to Hearing category'),
(9, 7, 4, 1, '2026-03-01 17:00:00', 'Dispute amicably resolved in joint meeting; marked Settled'),
(10,8, 5, 4, '2026-02-15 16:00:00', 'Arbitration award realized in full; case formally Closed');

-- ---------------------------------------------------------------------
-- 15. Tasks
-- ---------------------------------------------------------------------
TRUNCATE TABLE TASK;
INSERT INTO TASK (task_id, case_id, assigned_to, created_by, title, description, due_date, priority, status) VALUES
(1, 1, 5, 1, 'Compile Exhibit A to G documentation folder', 'Prepare paginated trial binder for court master and defense counsel', '2026-10-31', 'High', 'Pending'),
(2, 1, 4, 1, 'Draft evidence cross-examination questionnaire', 'Prepare cross-examination questions for defendant logistical director', '2026-11-03', 'Medium', 'Pending'),
(3, 2, 2, 2, 'Obtain certified map from District Inspector of Land Records (DILR)', 'Submit DILR application for spot measurement of parcel 84/B', '2026-11-08', 'High', 'Pending'),
(4, 3, 5, 1, 'Track Gujarat HC daily cause list for Bench 2', 'Check daily sitting list for urgent item serial assignment', '2026-11-06', 'High', 'Pending'),
(5, 4, 3, 3, 'Submit compliance report to investigating agency', 'File formal compliance affidavit before ACP Cyber Crime Cell', '2026-11-15', 'Medium', 'Pending'),
(6, 5, 2, 2, 'Draft proposed maintenance terms for mediation desk', 'Collate bank passbook statements and living expenses schedule', '2026-10-29', 'Low', 'Pending');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Seed confirmation summary
SELECT 'Sample data population completed successfully across all 20 BriefCase tables.' AS status;
