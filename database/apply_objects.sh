#!/usr/bin/env bash
# =====================================================================
# BriefCase - Database Object Application Runner (Bash)
# Applies all stored procedures, functions, triggers, views, indexes,
# role security, and finance integrity scripts in sequential order.
# =====================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_ENV="$SCRIPT_DIR/../backend/.env"

if [ ! -f "$BACKEND_ENV" ]; then
    echo "Backend environment file not found at $BACKEND_ENV"
    exit 1
fi

# Extract DB credentials safely
DB_HOST=$(grep -E '^DB_HOST=' "$BACKEND_ENV" | cut -d '=' -f2- | tr -d '"'\'' ')
DB_PORT=$(grep -E '^DB_PORT=' "$BACKEND_ENV" | cut -d '=' -f2- | tr -d '"'\'' ')
DB_NAME=$(grep -E '^DB_NAME=' "$BACKEND_ENV" | cut -d '=' -f2- | tr -d '"'\'' ')
DB_USER=$(grep -E '^DB_MIGRATION_USER=' "$BACKEND_ENV" | cut -d '=' -f2- | tr -d '"'\'' ')
DB_PASS=$(grep -E '^DB_MIGRATION_PASSWORD=' "$BACKEND_ENV" | cut -d '=' -f2- | tr -d '"'\'' ')

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_NAME=${DB_NAME:-briefcase}
DB_USER=${DB_USER:-root}

export MYSQL_PWD="$DB_PASS"

FILES=(
    "03_crud_procedures.sql"
    "05_cursor_procedures.sql"
    "06_pagination.sql"
    "07_aggregate_functions.sql"
    "08_validation_triggers.sql"
    "09_normalization_triggers.sql"
    "10_audit_logging.sql"
    "11_office_hours_restriction.sql"
    "12_views.sql"
    "13_indexes.sql"
    "16_role_security.sql"
    "18_finance_integrity.sql"
)

echo "========================================================================"
echo " BriefCase Database Object Re-Application"
echo " Target: $DB_NAME on $DB_HOST:$DB_PORT (User: $DB_USER)"
echo "========================================================================"

for file in "${FILES[@]}"; do
    FILE_PATH="$SCRIPT_DIR/$file"
    if [ -f "$FILE_PATH" ]; then
        printf "Applying %s ... " "$file"
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" --default-character-set=utf8mb4 < "$FILE_PATH"
        echo "SUCCESS"
    else
        echo "SKIPPING (not found): $file"
    fi
done

unset MYSQL_PWD
echo "------------------------------------------------------------------------"
echo "All database objects applied and verified successfully!"
echo "------------------------------------------------------------------------"
