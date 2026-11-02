-- =====================================================================
-- BriefCase - Finance Data Integrity & Seed Verification Script
-- SVNIT Surat | B.Tech II CSE | Semester III | CS203 DBMS Project
-- File: 18_finance_integrity.sql
-- =====================================================================

USE briefcase;

-- ---------------------------------------------------------------------
-- Part A: Idempotent Restoration of Seed Payments for Paid Invoices
-- Direct literal insertion to avoid MySQL error 1442 trigger re-entry
-- ---------------------------------------------------------------------

INSERT INTO PAYMENT (payment_id, case_id, payment_method_id, invoice_id, payment_date, amount, payment_status, description)
VALUES
(1, 2, 1, 2, '2026-02-02', 28000.00, 'Completed', 'RTGS transfer ref: HDFC0098251234 from Reliance Industries legal acct'),
(2, 2, 2, 3, '2026-02-10', 17500.00, 'Completed', 'UPI payment ref: 604128919012 by Sureshchandra Trivedi'),
(3, 3, 1, 4, '2026-02-20', 22000.00, 'Completed', 'Bank transfer from Deepak Diamonds corporate account'),
(4, 4, 1, 6, '2026-03-05', 18500.00, 'Completed', 'Immediate RTGS payment for bail application representation'),
(5, 6, 1, 7, '2025-11-15', 45000.00, 'Completed', 'Adani Logistics wire transfer settlement fee payment'),
(6, 5, 2, 9, '2025-08-28', 26000.00, 'Completed', 'UPI settlement fee payment'),
(7, 8, 4, 11, '2025-09-01', 49000.00, 'Completed', 'Axis Bank Cheque No: 409122 cleared'),
(8, 8, 1, 12, '2025-09-15', 28000.00, 'Completed', 'NEFT wire transfer cleared')
ON DUPLICATE KEY UPDATE
    case_id           = VALUES(case_id),
    payment_method_id = VALUES(payment_method_id),
    invoice_id        = VALUES(invoice_id),
    payment_date      = VALUES(payment_date),
    amount            = VALUES(amount),
    payment_status    = VALUES(payment_status),
    description       = VALUES(description);

-- ---------------------------------------------------------------------
-- Part B: Verification Check for Paid Invoices with Insufficient Payments
-- Lists any invoice marked 'Paid' whose completed payments are below its amount.
-- ---------------------------------------------------------------------
SELECT 
    i.invoice_id,
    i.invoice_number,
    i.amount AS invoice_amount,
    i.status AS invoice_status,
    COALESCE(SUM(p.amount), 0.00) AS total_paid,
    (i.amount - COALESCE(SUM(p.amount), 0.00)) AS outstanding_balance
FROM INVOICE i
LEFT JOIN PAYMENT p ON i.invoice_id = p.invoice_id AND p.payment_status = 'Completed'
WHERE i.status = 'Paid'
GROUP BY i.invoice_id, i.invoice_number, i.amount, i.status
HAVING total_paid < i.amount;
