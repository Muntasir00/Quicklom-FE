#!/bin/bash

# Script to fix all hardcoded localhost API URLs
# This will replace hardcoded localhost with imports from centralized config

echo "Fixing hardcoded API URLs..."

# List of files with hardcoded localhost
files=(
    "src/components/forms/ComprehensiveProfileForm.jsx"
    "src/components/forms/StructureLocumLicenseForm.jsx"
    "src/components/forms/StructureLocumMainForm.jsx"
    "src/components/messaging/Chat.jsx"
    "src/components/modals/UserProfileModal.jsx"
    "src/hooks/admin/contracts/useGeneralDentistryTemporaryForm.jsx"
    "src/hooks/admin/contracts/useGeneralPracticePermanentForm.jsx"
    "src/hooks/admin/contracts/useGeneralPracticeTemporaryForm.jsx"
    "src/hooks/admin/contracts/useNursingPermanentForm.jsx"
    "src/hooks/admin/contracts/useNursingTemporaryForm.jsx"
    "src/hooks/admin/contracts/usePermanentStaffingDentalForm.jsx"
    "src/hooks/admin/contracts/usePermanentStaffingPharmacyForm.jsx"
    "src/hooks/admin/contracts/usePharmacyTemporaryForm.jsx"
    "src/hooks/admin/contracts/useSpecialtyDentistryForm.jsx"
    "src/hooks/institute/contracts/useGeneralDentistryTemporaryForm.jsx"
    "src/hooks/institute/contracts/useGeneralPracticePermanentForm.jsx"
    "src/hooks/institute/contracts/useGeneralPracticeTemporaryForm.jsx"
    "src/hooks/institute/contracts/useNursingPermanentForm.jsx"
    "src/hooks/institute/contracts/useNursingTemporaryForm.jsx"
    "src/hooks/institute/contracts/usePermanentStaffingDentalForm.jsx"
    "src/hooks/institute/contracts/usePermanentStaffingPharmacyForm.jsx"
    "src/hooks/institute/contracts/usePharmacyTemporaryForm.jsx"
    "src/hooks/institute/contracts/useSpecialtyDentistryForm.jsx"
    "src/hooks/user/contracts/useShowContract.jsx"
    "src/pages/institute/profile/forms/DentalForm.jsx"
    "src/pages/institute/profile/forms/PharmacyForm.jsx"
    "src/pages/institute/profile/forms/PrivateClinicsAndPracticesForm.jsx"
    "src/pages/institute/profile/forms/RecruitmentAgencyForm.jsx"
    "src/pages/institute/profile/forms/StructureLocumLicenseForm.jsx"
    "src/pages/institute/profile/forms/StructureLocumMainForm.jsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Processing: $file"

        # Check if file already has the import
        if ! grep -q "import.*API_BASE_URL.*from.*@config/apiConfig" "$file" && \
           ! grep -q "import.*API_BASE_URL.*from.*@/config/apiConfig" "$file" && \
           ! grep -q "import.*API_BASE_URL.*from.*\.\./.*config/apiConfig" "$file"; then

            # Add import at the top (after the first import line)
            sed -i '0,/^import /s//import { API_BASE_URL } from "@config\/apiConfig";\nimport /' "$file"
        fi

        # Replace hardcoded localhost URLs
        sed -i 's/const API_BASE_URL = "http:\/\/localhost:8000"/\/\/ API_BASE_URL imported from config/g' "$file"
        sed -i 's/const API_BASE_URL = '\''http:\/\/localhost:8000'\''/\/\/ API_BASE_URL imported from config/g' "$file"
        sed -i 's/API_BASE_URL = "http:\/\/localhost:8000"/\/\/ API_BASE_URL imported from config/g' "$file"

        echo "  ✓ Fixed: $file"
    else
        echo "  ✗ Not found: $file"
    fi
done

echo ""
echo "✅ All files processed!"
echo ""
echo "Next steps:"
echo "1. Review the changes with: git diff"
echo "2. Test locally to ensure everything works"
echo "3. Let me know when you're ready, and I'll guide you on committing"
