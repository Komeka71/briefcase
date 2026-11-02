/**
 * Central Error Handler Middleware
 * Normalizes MySQL errors, role privilege denials, trigger validation signals, and HTTP errors
 */
function errorHandler(err, req, res, next) {
  console.error('API Error:', err);

  // 1. MySQL Custom SIGNAL SQLSTATE '45000' (From Triggers & Stored Procedures)
  if (err.sqlState === '45000' || err.code === 'ER_SIGNAL_EXCEPTION') {
    const msg = err.sqlMessage || err.message || 'Database validation rule violated.';
    const statusCode = (msg.toLowerCase().includes('forbidden') || msg.toLowerCase().includes('denied')) ? 403 : 400;
    return res.status(statusCode).json({
      success: false,
      errorType: 'TriggerOrProcedureValidation',
      message: msg
    });
  }

  // 2. MySQL Privilege Errors (ER_TABLEACCESS_DENIED_ERROR 1142, ER_COLUMNACCESS_DENIED_ERROR 1143, ER_SPECIFIC_ACCESS_DENIED_ERROR 1370, ER_DBACCESS_DENIED_ERROR 1044)
  const privilegeErrnos = [1142, 1143, 1370, 1044];
  const privilegeCodes = [
    'ER_TABLEACCESS_DENIED_ERROR',
    'ER_COLUMNACCESS_DENIED_ERROR',
    'ER_SPECIFIC_ACCESS_DENIED_ERROR',
    'ER_DBACCESS_DENIED_ERROR'
  ];
  if (privilegeErrnos.includes(err.errno) || privilegeCodes.includes(err.code)) {
    return res.status(403).json({
      success: false,
      errorType: 'DatabasePrivilegeDenied',
      message: 'Access Denied: Your database role does not have permission to perform this operation.'
    });
  }

  // 3. MySQL Foreign Key Delete/Update Restriction (ER_ROW_IS_REFERENCED_2)
  if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
    return res.status(409).json({
      success: false,
      errorType: 'ForeignKeyConstraint',
      message: 'Referential Integrity Violation: Cannot delete or update record because dependent records exist in another table.'
    });
  }

  // 4. MySQL Duplicate Key Error (ER_DUP_ENTRY)
  if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
    return res.status(409).json({
      success: false,
      errorType: 'DuplicateEntry',
      message: 'Unique Constraint Violation: A record with this unique identifier already exists.'
    });
  }

  // 5. Foreign Key Parent Missing (ER_NO_REFERENCED_ROW_2)
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
    return res.status(400).json({
      success: false,
      errorType: 'InvalidForeignKey',
      message: 'Referential Integrity Violation: Referenced parent record does not exist.'
    });
  }

  // 6. General / Standard Error
  const statusCode = err.status || err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    errorType: 'InternalServerError',
    message: err.message || 'An unexpected server error occurred.'
  });
}

module.exports = errorHandler;
